import rclnodejs, { getActionClientNamesAndTypesByNode, NamesAndTypesQueryResult, Node, Subscription } from "rclnodejs";
import { BrowserWindow, ipcMain } from 'electron';
import { setTimeout } from 'timers/promises';
import { NODES_DETAILS_TYPE } from "./RosTypes";
import { clearInterval } from "timers";
import { getActionServerNamesAndTypesByNode } from "rclnodejs";
// import { Node } from "rclnodejs";
// #include "interfaces/msg/custom_message.hpp" 
// interfaces::msg::CustomMessage

let gui_node: Node;
let globalWindow: BrowserWindow;
let interval: NodeJS.Timeout;

export const setupROS = (window: BrowserWindow) => {
  globalWindow = window;
  console.log("ENTEREDDD ROS SPACES");


  rclnodejs.init().then(async () => {
    gui_node = new rclnodejs.Node('control_gui');


    // gui_node.createSubscription('interfaces/msg/custom_message', 'topic', (msg) => {
    //   console.log(`Received message: ${typeof msg}`, msg);
    // })

    // [FIX] - see what happens if I don't wait here
    await setTimeout(5000);

    gui_node.spin();
  });
}

const IGNORED_TOPICS = {
  "/rosout": true,
  "/parameter_events": true,
}

const prev_parsed_subs: Record<string, Subscription> = {};
// const prev_parsed_srv: Record<string, Subscription> = {};

const getRemovednAddedItems = (news: string[], old: string[]) => {
  const added = news.filter(item => !old.includes(item));
  const removed = old.filter(item => !news.includes(item));

  return [added, removed]
}

const trackUpdates = (nodes_details: NODES_DETAILS_TYPE) => {
  try {

    // publishers map to be used to pair a subscriber later
    const publishers: {
      [pub_name: string]: {
        node: string;
        publisher: NODES_DETAILS_TYPE['publishers']['publishers'][0];
      }
    } = {};

    const parsed_publishers: Record<string, string> = {};
    // const parsed_servers: Record<string, string> = {};
  
    // First loop to populate the parsed_publishers and parsed_servers first
    Object.entries(nodes_details).forEach((val, i) => {
      const [node_name, n_dets] = val as [string, NODES_DETAILS_TYPE[string]];
      n_dets.publishers.forEach((n_det) => {
        if (!(n_det.name in IGNORED_TOPICS)) {
          publishers[n_det.name] = {
            node: node_name,
            publisher: n_det,
          };
        }
      });

      // 2nd map to populate the publisher and service server their message types
      Object.entries(nodes_details).forEach((val) => {
        const [_, n_dets] = val as [string, NODES_DETAILS_TYPE[string]];
        
        n_dets.subscribers.forEach((sub) => {
          // if the same topic exists in publishers, that means the pair would be displayed on the ui
          if (sub.name in publishers) {
            parsed_publishers[sub.name] = sub.types[0];
          }
        });
      });  
    })
  
    // Compare with prev ones, if already subscribed, ignore, if not (i.e new), subscribe and track,
    // else, remove previous sub and untrack
    const [added_subs, removed_subs] = getRemovednAddedItems(Object.keys(parsed_publishers), Object.keys(prev_parsed_subs));
    // const [added_srv, removed_srv] = getRemovednAddedItems(Object.keys(parsed_servers), Object.keys(prev_parsed_srv));
  
    added_subs.forEach((sub) => {
      if (sub in parsed_publishers) {
        console.log("HEYY Adding subs: ", sub)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // const new_sub: Subscription = gui_node.createSubscription(parsed_publishers[sub], sub, (msg) => {
        //   try {
        //     console.log(`Received message: ${typeof msg}`, msg);
    
        //     globalWindow.webContents.send(
        //       "ros:subscription_msg_received",
        //       {
        //         topic: sub,
        //         msg,
        //       }
        //     );  
        //   } catch (err) {
        //     console.log("HEYYY err", err)
        //   }
        // });
  
        // prev_parsed_subs[sub] = new_sub;
      }
    });
  
    removed_subs.forEach((sub) => {
      if (sub in prev_parsed_subs) {
        console.log("HEYY Removing subs: ", sub, prev_parsed_subs);
        if (!prev_parsed_subs[sub].isDestroyed()) {
          gui_node.destroySubscription(prev_parsed_subs[sub]);
  
          delete prev_parsed_subs[sub];
        }
        console.log("HEYY removed subs: ", prev_parsed_subs);
  
      }
    })
  
    // How to know when a client makes a service request? service calls are one-to-one
    // added_srv.forEach((sub) => {
    //   if (sub in parsed_publishers) {
    //     gui_node.createSubscription(parsed_publishers[sub], sub, (msg) => {
    //       console.log(`Received message: ${typeof msg}`, msg);
    //     });
    //   }
    // });
  } catch (err) {
    console.log("HEYY 544", err);
  }
};

let pollingStarted = false;
export const fetchROSNodesDetails = () => {
  let nodePubSubMap: NODES_DETAILS_TYPE = {};

  if (gui_node) {
    const nodeNames = gui_node.getNodeNamesAndNamespaces();
    
    try {
      nodeNames.forEach((n) => {

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
  }

  if (!pollingStarted) {
    console.log("HEYYY STARTING INTERVAL", pollingStarted)
    pollingStarted = true;
    pollGraphChanges();
  }
  
  trackUpdates(nodePubSubMap);
  return nodePubSubMap;
}

const hasChanged = (old: any, nnew: any) => {
  return JSON.stringify(old) !== JSON.stringify(nnew);
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