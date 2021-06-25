import { useCallback, useMemo, useState } from "react";
import { loadGraph, UserGraph } from "../../lib/methods";
import { StatusPing } from "../../lib/Status";
import { VkUser } from "../../lib/vkApi";

type GraphEdge = {
  source: number;
  target: number;
};
type Graph = {
  nodes: VkUser[];
  edges: GraphEdge[];
};

const useGraph = () => {
  const [minimumLinks, setMinimumLinks] = useState<number>(2);

  const [graph, setGraph] = useState<UserGraph>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusPing>();

  const loadGraphData = useCallback(async (id, settings?: any) => {
    setLoading(true);
    setGraph(await loadGraph(id, { depth: 1, onStatusChange: setStatus }));
    setLoading(false);
    setStatus(undefined);
  }, []);

  // const clickHandler = useCallback((user) => {
  //   loadMore(user);
  // }, []);

  // const loadMore = useCallback(async (parent: VkUser) => {
  //   let { items: friends } = await vkApi.getFriends(parent.id);
  //   setGraphData({ nodes: friends, parent });
  // }, []);

  const [graphData, users] = useMemo(
    () => [
      graph && graph.getGraph({ minimumLinks }),
      graph && graph.getAll({ minimumLinks }),
    ],
    [graph, minimumLinks]
  );

  return {
    users,
    graph,
    graphData,
    loading,
    status,
    loadGraphData,
  };
};

export default useGraph;
