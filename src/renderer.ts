/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

// const { ipcRenderer } = require('electron');
import { ipcRenderer } from 'electron';

import './index.css';
import './app';

// ipcRenderer.on("ros:nodes_details", (_event, value) => {
//   console.log("HEYY 121212", value);
// });

// ipcRenderer.on('topic-received', function (event, response) {
//   // document.getElementById('received-topic').innerText = response;
//   console.log("HEYYYYY 3333");
// });

console.log('👋 This message is being logged by "renderer.js", included via webpack');

// Add this to the end of the existing file