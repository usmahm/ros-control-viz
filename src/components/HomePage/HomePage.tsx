import React, { useEffect, useState } from "react";
import { ipcRenderer } from 'electron';
import styles from './HomePage.module.scss';
import { NODES_DETAILS_TYPE } from "../../RosTypes";

import GraphRender from "../GraphRender/GraphRender";

const HomePage = () => {
  const [nodesDetails, setNodesDetails] = useState<null | NODES_DETAILS_TYPE>(null)

  const fetchNRenderNodesDetails = async () => {
    const node_details: NODES_DETAILS_TYPE = await ipcRenderer.invoke("ros:fetch_nodes_details");

    setNodesDetails(node_details)
  }

  useEffect(() => {
    fetchNRenderNodesDetails();
    
    ipcRenderer.on("ros:nodes_details_updated", (_event, nodes_details) => {
      setNodesDetails(nodes_details);
    });

    ipcRenderer.on("ros:subscription_msg_received", (_event, data) => {
      // console.log("HEYY 0000", data);
    });
  }, []);
  
  return (
    <div className={styles.container}>
      <header>
        <h1>ROS Control Viz</h1>
        <button
          onClick={fetchNRenderNodesDetails}
        >
          Refresh
        </button>
      </header>

      <GraphRender
        nodesDetails={nodesDetails}
      />
    </div>
  );
};

export default HomePage;
