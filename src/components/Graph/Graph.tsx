import React, { FC, useCallback, useEffect, useReducer, useState } from "react";
import { ProgressBar } from "@blueprintjs/core";
import vkApi, { VkUser } from "../../lib/vkApi";
import { createGraph } from "./graphEngine";
import _ from "lodash";
import { loadGraph } from "../../lib/methods";
import useGraph from "./useGraph";
type GraphEngine = {
  setData: (nodes: VkUser[], links: GraphLink[]) => void;
};
type GraphProps = {
  rootUser: VkUser;
};
export type GraphLink = {
  source: number;
  target: number;
};
type GraphData = {
  nodes: VkUser[];
  links: GraphLink[];
};
type GraphDataReducerAction = {
  nodes: VkUser[];
  parent: VkUser;
};
type GraphDataReducer = (
  state: GraphData,
  action: GraphDataReducerAction
) => GraphData;

const userFilter = (user: VkUser) => !user.deactivated;

const graphDataReducer: GraphDataReducer = (
  state: GraphData,
  action: GraphDataReducerAction
): GraphData => {
  let newNodes = action.nodes.filter(userFilter);
  let links: GraphLink[] = [
    ...state.links,
    ...newNodes.map((n: VkUser) => ({
      source: n.id,
      target: action.parent.id,
    })),
  ];
  return {
    nodes: _.unionBy(state.nodes, newNodes, [action.parent], "id"),
    links,
  };
};

const Graph: FC<GraphProps> = (props) => {
  let { rootUser } = props;
  let { users, graph, graphData, loading, status, loadGraphData } = useGraph();
  let [graphEngine, setGraphEngine] = useState<GraphEngine>();
  // let [graphData, setGraphData] = useReducer<GraphDataReducer>(
  //   graphDataReducer,
  //   {
  //     links: [],
  //     nodes: [],
  //   }
  // );

  const containerAppearance = useCallback((container) => {
    if (container !== null) {
      setGraphEngine(createGraph(container, { onNodeClick: clickHandler }));
    }
  }, []);
  useEffect(() => {
    if (graphEngine && graphData) {
      graphEngine.setData(graphData.nodes, graphData.edges);
    }
  }, [graphData]);
  useEffect(() => {
    // loadMore(rootUser);
    // loadGraph(rootUser.id, { depth: 2, onStatusChange: console.log });
    loadGraphData(rootUser.id);
  }, [rootUser.id]);
  const clickHandler = useCallback((user) => {
    loadMore(user);
  }, []);

  const loadMore = useCallback(async (parent: VkUser) => {
    // let { items: friends } = await vkApi.getFriends(parent.id);
    // setGraphData({ nodes: friends, parent });
  }, []);

  return (
    <div className="full flex-column">
      {loading && (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            top: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ maxWidth: "100%", width: "400px" }}>
            {status && <div>{status.text}</div>}
            <ProgressBar intent="primary" animate value={status?.percent} />
          </div>
        </div>
      )}
      <svg
        key={rootUser?.id}
        style={{ width: "100%", height: "100%" }}
        ref={containerAppearance}
      />
    </div>
  );
};

export default Graph;
