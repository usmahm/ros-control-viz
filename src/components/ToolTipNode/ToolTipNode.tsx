import React, { memo, useEffect, useState } from "react";
import styles from "./ToolTipNode.module.scss";
import { 
  Handle, Node, NodeProps, NodeToolbar, Position
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { NODES_DETAILS_TYPE } from "../../RosTypes";
 
type MyNodeData = Node<{
  label: string;
  node_details: NODES_DETAILS_TYPE[string];
}>;

const NodeWithToolbar = memo(({ data, id }: NodeProps<MyNodeData>) => {
  const [hovered, setHovered] = useState(false);

  return (
    // <>
      <div
        key={id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <NodeToolbar
          isVisible={hovered}
          position={Position.Top}
        >
          <div
            className={styles.tooltip}
          >
            <h2>Published Topics: types</h2>
            {data?.node_details?.publishers?.length ?
              data?.node_details?.publishers?.map((pub) => (
              <p key={pub.name}>{pub.name}: {pub.types[0]}</p>
            )): (
              <p key={"none"}>None</p>
            )}

            <h2>Subscribed Topics: types</h2>
            {data?.node_details?.subscribers?.length ?
              data?.node_details?.subscribers?.map((pub) => (
              <p key={pub.name}>{pub.name}: {pub.types[0]}</p>
            )): (
              <p key={"none"}>None</p>
            )}
            
            <h2>Service Servers: types</h2>
            {data?.node_details?.services?.length ?
              data?.node_details?.services?.map((pub) => (
              <p key={pub.name}>{pub.name}: {pub.types[0]}</p>
            )): (
              <p key={"none"}>None</p>
            )}
            
            <h2>Service Clients: types</h2>
            {data?.node_details?.clients?.length ?
              data?.node_details?.publishers?.map((pub) => (
              <p key={pub.name}>{pub.name}: {pub.types[0]}</p>
            )): (
              <p key={"none"}>None</p>
            )}
          </div>
        </NodeToolbar>
        
        <div
          className={styles.node}
        >
          {data.label}
        </div>

        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    // </>
  );
});
 
export default NodeWithToolbar;