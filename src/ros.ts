import rclnodejs from "rclnodejs";
import { BrowserWindow, ipcMain } from 'electron';
import { setTimeout } from 'timers/promises';

export const setupROS = (window: BrowserWindow) => {
  console.log("ENTEREDDD ROS SPACES");

  rclnodejs.init().then(async () => {
    // let sender: Electron.WebContents | null = null;
    
    const gui_node = new rclnodejs.Node('control_gui');
    
    console.log("HEYYY 2222");

    // [FIX] - see what happens if I don't wait here
    await setTimeout(5000);

    const nodeNames = gui_node.getNodeNamesAndNamespaces();
    let nodePubSubMap = {};
    
    try {
      nodeNames.slice(1).forEach((n) => {
        console.log("HEYYY", n);

        nodePubSubMap = {
          ...nodePubSubMap,
          [n.name]: {
            publishers: gui_node.getPublisherNamesAndTypesByNode(n.name, n.namespace),
            subscribers: gui_node.getSubscriptionNamesAndTypesByNode(n.name, n.namespace),
          }
        }
      });
    } catch (err) {
      console.log("HEYYY222", err)
    }

    console.log(nodeNames, JSON.stringify(nodePubSubMap, null, 2));
    window.webContents.send("ros:nodes_details", nodePubSubMap);

    // const node = new rclnodejs.Node("publisher_example_node");

    // node.createSubscription("std_msgs/msg/String", 'topic', (msg) => {
    //   console.log("HEYYY 4444")
    //   if (sender) {
    //     sender.send('topic-received', msg.data);
    //   }
    // });

    // const publisher = node.createPublisher('std_msgs/msg/String', 'topic');

    ipcMain.on('publish-topic', (event, topic) => {
      // publisher.publish(topic);
      // sender = event.sender;
    });

    gui_node.spin();
  });
}