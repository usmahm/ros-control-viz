import rclnodejs, { getActionClientNamesAndTypesByNode, NamesAndTypesQueryResult, Node } from "rclnodejs";
import { BrowserWindow, ipcMain } from 'electron';
import { setTimeout } from 'timers/promises';
import { NODES_DETAILS_TYPE } from "./RosTypes";
import { clearInterval } from "timers";
import { getActionServerNamesAndTypesByNode } from "rclnodejs";
// import { Node } from "rclnodejs";

let gui_node: Node;
let globalWindow: BrowserWindow;
let interval: NodeJS.Timeout;

export const setupROS = (window: BrowserWindow) => {
  globalWindow = window;
  console.log("ENTEREDDD ROS SPACES");


  rclnodejs.init().then(async () => {
    gui_node = new rclnodejs.Node('control_gui');


    // [FIX] - see what happens if I don't wait here
    await setTimeout(5000);

    gui_node.spin();
  });
}

let pollingStarted = false;

export const fetchROSNodesDetails = () => {
  let nodePubSubMap: NODES_DETAILS_TYPE = {};

  if (gui_node) {
    const nodeNames = gui_node.getNodeNamesAndNamespaces();
    
    try {
      nodeNames.slice(1).forEach((n) => {
        // console.log("HEYYY", n);

        nodePubSubMap = {
          ...nodePubSubMap,
          [n.name]: {
            publishers: gui_node.getPublisherNamesAndTypesByNode(n.name, n.namespace),
            subscribers: gui_node.getSubscriptionNamesAndTypesByNode(n.name, n.namespace),
            services: gui_node.getServiceNamesAndTypesByNode(n.name, n.namespace),
            clients: gui_node.getClientNamesAndTypesByNode(n.name, n.namespace),
          }
        }
      });
    } catch (err) {
      // console.log("HEYYY222", err)
    }

    // console.log(nodeNames, JSON.stringify(nodePubSubMap, null, 2));
  }

  if (!pollingStarted) {
    console.log("HEYYY STARTING INTERVAL", pollingStarted)
    pollingStarted = true;
    pollGraphChanges();
  }
  
  return nodePubSubMap;
}

const pollGraphChanges = () => {
  let old_dets = fetchROSNodesDetails();

  clearInterval(interval);
  
  interval = setInterval(() => {
    const new_dets = fetchROSNodesDetails();

    if (hasChanged(old_dets, new_dets)) {
      globalWindow.webContents.send("ros:nodes_details_updated", new_dets);
      old_dets = new_dets;
    }
  }, 2000);
}

const hasChanged = (old: any, nnew: any) => {
  return JSON.stringify(old) !== JSON.stringify(nnew);
}