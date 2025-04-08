import '@xyflow/react/dist/style.css';
import styles from './GraphRender.module.scss';
import { 
  Background, ConnectionLineType,
  Edge, MarkerType, Node, ReactFlow,
  useEdgesState, useNodesState,
  type EdgeTypes,
} from "@xyflow/react";
import dagre from "dagre";
import { NODES_DETAILS_TYPE } from '../../RosTypes';
import NodeWithToolbar from '../ToolTipNode/ToolTipNode';
import EdgeWithLabel from '../EdgeWithLabel/EdgeWithLabel';
import React, { useEffect } from "react";

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

type Props = {
  nodesDetails: NODES_DETAILS_TYPE,
}

const GraphRender: React.FC<Props> = ({ nodesDetails }) => {
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
        publisher: NODES_DETAILS_TYPE['publishers']['publishers'][0];
      }
    } = {};
    
    // services server map to be used to pair a services clients later
    const services: {
      [serv_name: string]: {
        node: string;
        service: NODES_DETAILS_TYPE['services']['services'][0];
      }
    } = {};

    // First loop to populate the nodes_map, pulishers, and services first
    Object.entries(nodes_details).forEach((val, i) => {
      const [node_name, n_dets] = val as [string, NODES_DETAILS_TYPE[string]];

      nodes_map[node_name] = {
        id: i.toString(),
        position: {x: 0, y: 0},
        type: 'node-with-toolbar',
        data: {
          label: node_name,
          node_details: {
            publishers: n_dets.publishers,
            subscribers: n_dets.subscribers,
            clients: n_dets.clients,
            services: n_dets.services,
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
      });

      n_dets.services.forEach((n_det) => {
        if (!(n_det.name in IGNORED_TOPICS)) {
          services[n_det.name] = {
            node: node_name,
            service: n_det,
          };
        }
      })
    })

    const parsed_edges: Edge[] = [];

    // 2nd map to populate the parsed_edges, by pairing with the publishers as the source
    Object.entries(nodes_details).forEach((val) => {
      const [node_name, n_dets] = val as [string, NODES_DETAILS_TYPE[string]];

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
            },
          })
        }
      });

      n_dets.clients.forEach((sub) => {
        if (node_name in nodes_map && sub.name in services) {
          const source = nodes_map[services[sub.name].node].id;

          parsed_edges.push({
            source,
            target: nodes_map[node_name].id,
            id: `${services[sub.name].node}-${node_name}-${sub.name}`,
            type: 'with-label',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            markerStart: {
              type: MarkerType.ArrowClosed,
              orient: 'auto-start-reverse',
              width: 20,
              height: 20,
            },
            data: {
              label: `${sub.name}: ${sub.types[0]}`,
            },
            style: {
              stroke: 'blue',
            },

            // Can it render this out of the box
            // label: 'marker start and marker end',
          })
        }
      });
    });

    const { layouted_nodes } = getLayoutedElements(Object.values(nodes_map), parsed_edges)

    setEdges(parsed_edges);
    setNodes(layouted_nodes);
  }

  useEffect(() => {
    if (nodesDetails)
      processRenderNodeDetails(nodesDetails);
  }, [nodesDetails])

  return (
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
  )
}

export default GraphRender;
