import React, { useEffect, useState } from "react";
import { ipcRenderer } from 'electron';
import dagre from "dagre";
import '@xyflow/react/dist/style.css';
import styles from './HomePage.module.scss';
import { Background, Controls, MiniMap, Node, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
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

  console.log("HEYYY 111 rendered homepage",)
  // const [topic, setTopic] = useState("test");
  // const [backT, setBackT] = useState("test");

  useEffect(() => {
    console.log("HEYYY ", nodes, edges);
  }, [nodes, edges])
  

  ipcRenderer.on("ros:nodes_details", (_event, nodes_details) => {
    console.log("HEYY 121212", nodes_details);
    

    const nodes_map: { [key: string]: Node } = {};

    const publishers: {
      [pub_name: string]: {
        node: string;
        publisher: ROSNodesDetails['publishers']['publishers'][0];
      }
    } = {};

    Object.entries(nodes_details).forEach((val, i) => {
      const [node_name, n_dets] = val as [string, ROSNodesDetails[string]];

      nodes_map[node_name] = {
        id: i.toString(),
        data: { label: node_name },
        position: {x: 0, y: 0}
      };

      n_dets.publishers.forEach((n_det) => {
        publishers[n_det.name] = {
          node: node_name,
          publisher: n_det,
        };
      })
    })

    const parsed_edges: {
      id: string;
      source: string;
      target: string;
    }[] = [];

    Object.entries(nodes_details).forEach((val) => {
      const [node_name, n_dets] = val as [string, ROSNodesDetails[string]];

      n_dets.subscribers.forEach((sub) => {
        if (node_name in nodes_map && sub.name in publishers) {
          const source = nodes_map[publishers[sub.name].node].id;
          parsed_edges.push({
            source,
            target: nodes_map[node_name].id,
            id: `${publishers[sub.name].node}-${node_name}-${sub.name}`,
          })
        }
      })
    });

    const { layouted_nodes } = getLayoutedElements(Object.values(nodes_map), parsed_edges)

    setEdges(parsed_edges);
    setNodes(layouted_nodes);
  });

  // const handleSend = () => {
  //   ipcRenderer.send('publish-topic', topic);
  // }

  // ipcRenderer.on('topic-received', function (event, response) {
  //   // document.getElementById('received-topic').innerText = response;
  //   setBackT(response);
  // });

  return (
    <div className={styles.container}>
      {/* <input type="text" onChange={(val) => setTopic(val.target.value)} />
      <button onClick={handleSend}>Send</button>
      <p>{topic}</p>
      <p>{backT}</p> */}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        // onConnect
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default HomePage;
