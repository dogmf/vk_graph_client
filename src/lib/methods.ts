import { Sequencer } from "./Sequencer";
import { Status, StatusPingFunction } from "./Status";
import api, { VkUser } from "./vkApi";

const DEFAULT_SETTINGS = {
  depth: 1,
};

type GetterParams = {
  loaded?: boolean;
  minimumLinks?: number;
};

export class UserGraph {
  usersIndex: { [id: number]: VkUser } = {};
  friendsIndex: { [id: number]: Set<number> } = {};
  loadedIndex: { [id: number]: boolean } = {};
  add(user: VkUser, user2?: VkUser) {
    if (!this.usersIndex[user.id]) this.usersIndex[user.id] = user;

    if (!this.friendsIndex[user.id]) this.friendsIndex[user.id] = new Set();

    if (user2?.id) {
      this.friendsIndex[user.id].add(user2.id);
      this.friendsIndex[user2.id].add(user.id);
    }
  }
  setLoaded(user: VkUser) {
    this.loadedIndex[user.id] = true;
  }
  getAllNotLoaded() {
    return Object.keys(this.usersIndex)
      .map(Number) // Костыль
      .filter((id) => !this.loadedIndex[id])
      .map((id) => this.usersIndex[id]);
  }
  getAll(params: GetterParams = {}) {
    let { loaded, minimumLinks } = params;
    let all = Object.keys(this.usersIndex).map(Number);
    if (loaded !== undefined)
      all = all.filter((id) =>
        loaded ? this.loadedIndex[id] : !this.loadedIndex[id]
      );
    if (minimumLinks)
      all = all.filter(
        (id) => minimumLinks && this.friendsIndex[id]?.size >= minimumLinks
      );
    return all.map((id) => this.usersIndex[id]);
  }
  getGraph(params?: GetterParams) {
    let nodes = this.getAll(params);
    const nodesIndex = nodes.reduce<{ [id: number]: VkUser }>((i, n) => {
      i[n.id] = n;
      return i;
    }, {});
    const connectedIndex: { [id: number]: { [id: number]: boolean } } = {};
    let edges = nodes.reduce<{ source: number; target: number }[]>(
      (es, user) => {
        let id = user.id;
        this.friendsIndex[user.id].forEach((id2) => {
          if (!nodesIndex[id2]) return;
          if (!connectedIndex[id2]?.[id]) {
            if (!connectedIndex[id2]) connectedIndex[id2] = { [id]: true };
            else connectedIndex[id2][id] = true;
            es.push({ source: id, target: id2 });
          }
        });
        return es;
      },
      []
    );
    return {
      nodes,
      edges,
    };
  }
}

type settings = {
  depth?: number;
  onStatusChange?: StatusPingFunction;
};
export const loadGraph = async (
  userId: string | number,
  settings: settings = {}
) => {
  let { depth = DEFAULT_SETTINGS.depth, onStatusChange } = settings;
  let toLoad = 0;
  let graph = new UserGraph();
  let st = new Status(onStatusChange);
  let sq = new Sequencer();
  const loadFriends = async (user: VkUser) => {
    if (!user.is_closed && !user.deactivated) {
      let friends = await sq.run(() => api.getFriends(user.id));
      for (let friend of friends.items) graph.add(friend, user);
      st.t(`Загрузка друзей`)
        .p(Object.keys(graph.loadedIndex).length / toLoad)
        .tick();
    }
    graph.setLoaded(user);
  };

  toLoad = 1;
  st.t("Загрузка отсчетного пользователя").tick();
  let rootUser = await api.getUser(userId);
  graph.add(rootUser);

  st.t("Загрузка друзей пользователя").tick();
  await loadFriends(rootUser);

  for (let i = 0; i < depth; i++) {
    let friends = graph.getAll({ loaded: false });
    toLoad += friends.length;
    await Promise.all(friends.map(loadFriends));
  }

  return graph
};
