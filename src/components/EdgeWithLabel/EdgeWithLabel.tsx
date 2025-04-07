import {
  type EdgeProps,
  type Edge,
  // getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath
} from "@xyflow/react";
import styles from "./EdgeWithLabel.module.scss";
import React from "react";

const EdgeWithLabel: React.FC<EdgeProps<Edge<{ label: string }>>> = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  ...props
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} {...props} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={`${styles.label} nodrag nopan`}
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
};

export default EdgeWithLabel;