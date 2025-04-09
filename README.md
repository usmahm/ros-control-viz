# ROS 2 Control Ecosystem Visualization

![Application Screenshot](https://github.com/user-attachments/assets/c83222bd-0af9-45ee-9be7-2876ac287ff6)

This repository demonstrates an **Electron + React + TypeScript** application for visualizing ROS 2 node interactions in real time. It renders a Directed Acyclic Graph (DAG) representing publishers, subscribers, and services, fulfilling the **visualization portion** of PAL Robotics qualification task.

---

## Features

- **Dynamic DAG Rendering:** Visualizes ROS 2 publishers, subscribers, and services in real time.
- **Desktop Application:** Built using Electron for a seamless desktop experience.
- **Automatic Layout:** Utilizes Dagre for graph autolayout.
- **Interactive Graph:** Built with XYFlow for rendering and interaction.
- **Custom Metadata Display:** Displays node-specific metadata using React components.

---

## Technologies Used

- **Electron:** Packages the application into a desktop environment.
- **React:** Manages the UI and state for the graph.
- **TypeScript:** Ensures type safety and maintainability.
- **XYFlow:** Provides graph rendering and interaction components.
- **Dagre:** Automatically arranges the graph layout.
- **rclnodejs:** Enables ROS 2 communication in the Node.js (main) process.

---

## Installation & Setup

### Prerequisites

Ensure the following are installed:

- **ROS 2** (e.g., Humble) installed and sourced.
- **Node.js** (v18+) and either **Yarn** or **npm**.

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/ros2-control-dag.git
   cd ros2-control-dag
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Electron App**
   ```bash
   npm run start
   ```
   or 
   ```bash
   npm run start-with-cpp20
   ``` 

This launches an Electron window that requests node details (publishers, subscribers, services) from the main process and renders them as a DAG in the renderer process.

---

## How It Works

### Architecture Overview

![Flow Diagram](https://github.com/user-attachments/assets/2cb9268a-cabd-4988-9175-dcc63f0b9c63)

The application consists of two main components:

1. **Main Process (Electron + rclnodejs):**
   - Initializes a `rclnodejs` node to gather topic, subscriber, and service data from ROS 2.
   - Relays this information to the renderer process via IPC.

2. **Renderer Process (React + TypeScript):**
   - Fetches node details using `ipcRenderer.invoke("ros:fetch_nodes_details")`.
   - Updates the graph dynamically when the main process emits events (e.g., `"ros:nodes_details_updated"`).

2. **Graph Visualization:**
   - `GraphRender.tsx` uses XYFlow to build a node/edge graph, with Dagre handling automatic layout.
   - Each node displays metadata (e.g., name, publishers, subscribers, etc.).