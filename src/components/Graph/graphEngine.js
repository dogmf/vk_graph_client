import * as d3 from "d3";

// Не typescript, ибо есть много нюансов сопряжения с d3.
// За основу взята работа с просторов интернета https://github.com/ninjaconcept/d3-force-directed-graph/blob/master/example/4-dynamic-updates.html

const MANY_BODIES_FORCE = -300; // -500
const LINK_FORCE = 0.07; // 0.2
const COLLISION_FORCE_RADIUS = 25; // null

export const createGraph = (container, config = {}) => {
  let { onNodeClick } = config;
  let { height, width } = container.getBoundingClientRect();
  console.log({ width, height });

  var nodes = [];
  var links = [];

  var containerSVG = d3.select(container);
  var group = d3.select(container).append("g");
  addRefs(containerSVG);

  var linkElements, nodeElements;

  // we use svg groups to logically group the elements together
  var linkGroup = group.append("g").attr("class", "links");
  var nodeGroup = group.append("g").attr("class", "nodes");

  // we use this reference to select/deselect
  // after clicking the same element twice
  var selectedId;

  // simulation setup with all forces
  var linkForce = d3
    .forceLink()
    .id(function (link) {
      return link.id;
    })
    .strength(LINK_FORCE);

  var simulation = d3
    .forceSimulation()
    .force("link", linkForce)
    .force("charge", d3.forceManyBody().strength(MANY_BODIES_FORCE))
    .force("center", d3.forceCenter(width / 2, height / 2));

  if (COLLISION_FORCE_RADIUS)
    simulation.force(
      "collision",
      d3.forceCollide().radius(COLLISION_FORCE_RADIUS)
    );

  var dragDrop = d3
    .drag()
    .on("start", function (event, node) {
      node.fx = node.x;
      node.fy = node.y;
    })
    .on("drag", function (event, node) {
      simulation.alphaTarget(0.7).restart();
      node.fx = event.x;
      node.fy = event.y;
    })
    .on("end", function (event, node) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      node.fx = null;
      node.fy = null;
    });

  var zoom_handler = d3.zoom().on("zoom", zoom_actions);
  function zoom_actions(e) {
    group.attr("transform", e.transform);
  }
  zoom_handler(containerSVG);

  function setData(newNodes, newLinks) {
    nodes = newNodes;
    let nodesIndex = nodes.reduce((obj, node) => {
      obj[node.id] = node;
      return obj;
    }, {});
    links = newLinks.map((link) => ({
      ...link,
      source: nodesIndex[link.source],
      target: nodesIndex[link.target],
    }));
    console.log({ nodes, links });
    updateSimulation();
  }

  function updateGraph() {
    // links
    linkElements = linkGroup.selectAll("line").data(links, function (link) {
      return link.target.id + link.source.id;
    });

    linkElements.exit().remove();

    var linkEnter = linkElements
      .enter()
      .append("line")
      .attr("stroke-width", 1)
      .attr("stroke", "rgba(50, 50, 50, 0.2)");

    linkElements = linkEnter.merge(linkElements);

    // nodes
    nodeElements = nodeGroup.selectAll("svg").data(nodes, function (node) {
      return node.id;
    });

    nodeElements.exit().remove();

    var nodeEnter = nodeElements
      .enter()
      .append("svg")
      .style("overflow", "auto")
      .call(dragDrop)
      .style("cursor", (user) => (user.is_closed ? "not-allowed" : "pointer"))
      .on("click", (e, user) => !user.is_closed && onNodeClick(user));
    const imageSize = 50;
    nodeEnter
      .append("circle")
      .attr("r", imageSize / 2 + 1)
      .attr("cx", imageSize / 2)
      .attr("cy", imageSize / 2)
      .attr("fill", (user) => (user.is_closed ? "crimson" : "black"));
    nodeEnter
      .append("image")
      .attr("width", imageSize)
      .attr("href", (user) => user.photo_50)
      .attr("clip-path", "url(#clip-circle)");
    nodeEnter.append("text").text((n) => n.screen_name);

    nodeElements = nodeEnter.merge(nodeElements);
  }

  function updateSimulation() {
    updateGraph();

    simulation.nodes(nodes).on("tick", () => {
      nodeElements
        .attr("x", function (node) {
          return node.x;
        })
        .attr("y", function (node) {
          return node.y;
        });
      linkElements
        .attr("x1", function (link) {
          return link.source.x;
        })
        .attr("y1", function (link) {
          return link.source.y;
        })
        .attr("x2", function (link) {
          return link.target.x;
        })
        .attr("y2", function (link) {
          return link.target.y;
        });
    });

    simulation.force("link").links(links);
    simulation.alphaTarget(0.7).restart();
  }

  // last but not least, we call updateSimulation
  // to trigger the initial render
  updateSimulation();

  return {
    setData,
  };
};

function addRefs(svg) {
  let defs = svg.append("defs");

  defs
    .append("clipPath")
    .attr("id", "clip-circle")
    .attr("clipPathUnits", "objectBoundingBox")
    .append("circle")
    .attr("cx", ".5")
    .attr("cy", ".5")
    .attr("r", ".5");
}
