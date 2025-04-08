# ROS 2 Control Ecosystem Visualization

This repository demonstrates an **Electron + React + TypeScript** application that displays a simple Directed Acyclic Graph (DAG) representing ROS 2 node interactions such as publishers, subscribers, and services. It fulfills the **visualization portion** of a qualification task by showcasing how to render a graph of ROS 2 relationships in real time.

---

## What This Repository Covers

- **Renders a dynamic DAG** of ROS 2 publishers, subscribers, and services in a TypeScript environment.  
- Uses **Electron** to package the application into a desktop-like environment.  
- Applies **Dagre** for autolayout and **XYFlow** for rendering and interaction.  
- Displays node metadata via custom React components.

---

## Technologies Used

- **Electron:** Creates a desktop application from a Node.js + Chromium environment.  
- **React:** Manages the UI and state for the graph.  
- **TypeScript:** Ensures type safety across the codebase.  
- **XYFlow:** Provides graph building and rendering components.  
- **Dagre:** Automatically arranges the graph layout.  
- **rclnodejs:** Facilitates ROS 2 communication in the Node.js (main) process.

---

## Installation & Setup

### Prerequisites

- **ROS 2** (e.g., Humble) installed and correctly sourced.  
- **Node.js** (v18+) and either **Yarn** or **npm** installed.

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/ros2-control-dag.git
   cd ros2-control-dag
2. **Install Dependencies**
   ```bash
   npm install
   
3. **Start the Electron App**
   ```bash
   npm run start
   
This launches an Electron window, which requests node details (publishers, subscribers, services) from the main process and renders them as a DAG in the renderer process.

---

## How It Works

### Electron + rclnodejs (Main Process)

- The main process initializes a `rclnodejs` node to gather topic/subscriber/service data from ROS 2 and relay that information via IPC.

### Renderer (React + TypeScript)

- `HomePage.tsx` calls `ipcRenderer.invoke("ros:fetch_nodes_details")` to retrieve node details.

- When data changes, the main process emits an event (e.g., `"ros:nodes_details_updated"`), triggering the renderer to update its internal state.

### Graph Visualization

- `GraphRender.tsx` uses XYFlow to build a node/edge graph, with Dagre handling automatic layout.

- Each node displays metadata (e.g., name, publishers, subscribers, etc.).

---
