import React, { FC, useCallback, useEffect, useReducer, useState } from "react";
import vkApi, { VkUser } from "../../lib/vkApi";
import { createGraph } from "./graphEngine";
import _ from "lodash";
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

  let [graph, setGraph] = useState<GraphEngine>();
  let [graphData, setGraphData] = useReducer<GraphDataReducer>(
    graphDataReducer,
    {
      links: [],
      nodes: [],
    }
  );

  const containerAppearance = useCallback((container) => {
    if (container !== null) {
      setGraph(createGraph(container, { onNodeClick: clickHandler }));
    }
  }, []);
  useEffect(() => {
    if (graph && graphData) {
      graph.setData(graphData.nodes, graphData.links);
    }
  }, [graph, graphData]);
  useEffect(() => {
    loadMore(rootUser);
  }, []);
  const clickHandler = useCallback((user) => {
    loadMore(user);
  }, []);

  const loadMore = useCallback(async (parent: VkUser) => {
    let { items: friends } = await vkApi.getFriends(parent.id);
    setGraphData({ nodes: friends, parent });
  }, []);

  return (
    <svg style={{ width: "100%", height: "100%" }} ref={containerAppearance} />
  );
};

export default Graph;
