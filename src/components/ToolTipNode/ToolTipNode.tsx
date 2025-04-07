import React, { memo, useEffect, useState } from "react";
import styles from "./ToolTipNode.module.scss";
import { 
  Handle, Node, NodeProps, NodeToolbar, Position
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
 
type MyNodeData = Node<{
  label: string;
  node_details: {
    publishers: {
      name: string;
      types: string[];
    }[];
    subscribers: {
      name: string;
      types: string[];
    }[];
  };
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
            {data?.node_details?.publishers?.map((pub) => (
              <p key={pub.name}>{pub.name}: {pub.types[0]}</p>
            ))}
            
            <h2>Subscribed Topics: types</h2>
            {data?.node_details?.subscribers?.map((pub) => (
              <p key={pub.name}>{pub.name}: {pub.types[0]}</p>
            ))}
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