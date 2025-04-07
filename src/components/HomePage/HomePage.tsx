import React, { useEffect, useState } from "react";
import { ipcRenderer } from 'electron';
import dagre from "dagre";
import '@xyflow/react/dist/style.css';
import styles from './HomePage.module.scss';
import { 
  Background, ConnectionLineType, Controls,
  Edge, MarkerType, MiniMap, Node, ReactFlow,
  useEdgesState, useNodesState,
  type EdgeTypes,
} from "@xyflow/react";
import { NODES_DETAILS_TYPE } from "../../RosTypes";
// import TooltipNodeComp from "../ToolTipNode/ToolTipNode";
import NodeWithToolbar from "../ToolTipNode/ToolTipNode";
import EdgeWithLabel from "../EdgeWithLabel/EdgeWithLabel";
// import { ipcRenderer } from "electron";

type ROSNodesDetails = {
  [key: string]: {
    publishers: {
      name: string;
      types: string[];
    }[];
    subscribers: {
      name: string;
      types: string[];
    }[];
  }
}

const node_width = 172;
const node_height = 36;

const nodeTypes = {
  'node-with-toolbar': NodeWithToolbar,
};

const edgeTypes: EdgeTypes = {
  'with-label': EdgeWithLabel
}

const IGNORED_TOPICS = {
  "/rosout": true,
  "/parameter_events": true,
}

const getLayoutedElements = (
  nodes: Node[],
  edges: { id: string; target: string; source: string }[]
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // TB or LR
  dagreGraph.setGraph({ rankdir: "LR" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node_width, height: node_height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layouted_nodes = nodes.map((node) => {
    const node_with_position = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: node_with_position.x - node_width / 2,
        y: node_with_position.y - node_height / 2,
      },
    };
  });

  return { layouted_nodes, layouted_edges: edges };
};

const HomePage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // console.log("HEYYY 111 rendered homepage",)

  const processRenderNodeDetails = (nodes_details: NODES_DETAILS_TYPE) => {
    console.log("HEYY 121212", nodes_details);
    
    // Each node to be rendered
    const nodes_map: { [key: string]: Node } = {};

    // publishers map to be used to pair a subscriber later
    const publishers: {
      [pub_name: string]: {
        node: string;
        publisher: ROSNodesDetails['publishers']['publishers'][0];
      }
    } = {};

    // First loop to populate the nodes_map and pulishers first
    Object.entries(nodes_details).forEach((val, i) => {
      const [node_name, n_dets] = val as [string, ROSNodesDetails[string]];

      nodes_map[node_name] = {
        id: i.toString(),
        position: {x: 0, y: 0},
        type: 'node-with-toolbar',
        data: {
          label: node_name,
          node_details: {
            publishers: n_dets.publishers,
            subscribers: n_dets.subscribers,
          }
        }
      };

      n_dets.publishers.forEach((n_det) => {
        if (!(n_det.name in IGNORED_TOPICS)) {
          publishers[n_det.name] = {
            node: node_name,
            publisher: n_det,
          };
        }
      })
    })

    const parsed_edges: Edge[] = [];

    // 2nd map to populate the parsed_edges, by pairing with the publishers as the source
    Object.entries(nodes_details).forEach((val) => {
      const [node_name, n_dets] = val as [string, ROSNodesDetails[string]];

      n_dets.subscribers.forEach((sub) => {
        if (node_name in nodes_map && sub.name in publishers) {
          const source = nodes_map[publishers[sub.name].node].id;

          parsed_edges.push({
            source,
            target: nodes_map[node_name].id,
            id: `${publishers[sub.name].node}-${node_name}-${sub.name}`,
            type: 'with-label',
            markerEnd: {
              type: MarkerType.Arrow,
              width: 20,
              height: 20,
            },
            data: {
              label: `${sub.name}: ${sub.types[0]}`,
            }
          })
        }
      })
    });

    const { layouted_nodes } = getLayoutedElements(Object.values(nodes_map), parsed_edges)

    setEdges(parsed_edges);
    setNodes(layouted_nodes);
  }


  const fetchNRenderNodesDetails = async () => {
    const node_details: NODES_DETAILS_TYPE = await ipcRenderer.invoke("ros:fetch_nodes_details");

    processRenderNodeDetails(node_details)
  }

  useEffect(() => {
    fetchNRenderNodesDetails();
    
    ipcRenderer.on("ros:nodes_details_updated", (_event, nodes_details) => {
      processRenderNodeDetails(nodes_details);
    });
  }, []);
  
  return (
    <div className={styles.container}>
      <button
        onClick={fetchNRenderNodesDetails}
      >Refresh</button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        style={{ backgroundColor: "#F7F9FB" }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default HomePage;
