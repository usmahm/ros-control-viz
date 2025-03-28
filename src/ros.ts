import rclnodejs from "rclnodejs";
import { ipcMain } from 'electron';

export const setupROS = () => {
  console.log("ENTEREDDD ROS SPACES");

  ipcMain.on('publish-topic', (event, topic) => {
    console.log("HEYYY pp2");
      // publisher.publish(topic);
      // sender = event.sender;
    });

  rclnodejs.init().then(() => {
    console.log("HEYYY 2222");
    let sender: Electron.WebContents | null = null;

    const node = rclnodejs.createNode("publisher_example_node");

    node.createSubscription("std_msgs/msg/String", 'topic', (msg) => {
      console.log("HEYYY 4444")
      if (sender) {
        sender.send('topic-received', msg.data);
      }
    });

    const publisher = node.createPublisher('std_msgs/msg/String', 'topic');

    ipcMain.on('publish-topic', (event, topic) => {
      publisher.publish(topic);
      sender = event.sender;
    });

    rclnodejs.spin(node);
  });
}