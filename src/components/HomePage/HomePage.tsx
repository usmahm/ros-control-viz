import React, { useState } from "react";
import styles from './HomePage.module.scss';
import { ipcRenderer } from "electron";

const HomePage = () => {
  console.log("HEYYY 111 rendered homepage",)
  const [topic, setTopic] = useState("test");
  const [backT, setBackT] = useState("test");

  const handleSend = () => {
    ipcRenderer.send('publish-topic', topic);
  }

  ipcRenderer.on('topic-received', function (event, response) {
    // document.getElementById('received-topic').innerText = response;
    setBackT(response);
  });

  return (
    <div className={styles.container}>
      <input type="text" onChange={(val) => setTopic(val.target.value)} />
      <button onClick={handleSend}>Send</button>
      <p>{topic}</p>
      <p>{backT}</p>
    </div>
  );
};

export default HomePage;
