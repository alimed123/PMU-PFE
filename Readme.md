
# PMU Dashboard Project Overview

Here’s an overview of your project, referencing both the frontend and backend documentation.

## Project Description

This project is a full-stack solution for real-time monitoring and visualization of Phasor Measurement Unit (PMU) data. It consists of a **React + Vite** frontend and a **FastAPI** backend that communicates with an **InfluxDB** time-series database.

## Structure

- **Frontend: PMU Dashboard Frontend**
  - Built with React and Vite
  - Provides real-time dashboards, graphs, event tables, and notifications for PMU data

- **Backend: PMU Backend Service**
  - FastAPI-based REST and WebSocket API for retrieving, processing, and alerting on PMU data from InfluxDB

## Key Features

- **User Authentication:** Simple local login for dashboard access
- **Real-Time Visualization:** Live power metrics, phasor diagrams, and event tables
- **Graphing:** Time series and scatter plots for power, voltage, and current
- **Notifications:** Real-time alerts for abnormal voltage/current via WebSocket
- **Protocol Switching:** Change backend protocol (UDP/TCP) from the frontend
- **Responsive UI:** Styled with Tailwind CSS for modern look and feel

## How It Works

### Backend

- Connects to InfluxDB to fetch and aggregate PMU measurements
- Exposes REST endpoints for power calculations, PMU listing, and raw data
- Provides a WebSocket endpoint for real-time anomaly alerts
- Allows protocol switching via API

### Frontend

- Authenticates users and displays dashboards
- Fetches data from the backend API for visualization
- Listens to WebSocket alerts for instant notifications
- Lets users select PMU, protocol, timeline, and phase for custom views

## Documentation Links

- [PMU Backend Service README](./Backend/Backend%20README.md)  
  Details on backend setup, configuration, API endpoints, and troubleshooting.

- [PMU Dashboard Frontend README](./FrontEnd/FRONTENDREADME.md)  
  Instructions for installing, running, and using the React frontend.

- [PMU-PDC Simulator Documentation](./PMUPDCSIM/ReadmeSIM.md)  
  Guide for the PMU and PDC simulation notebooks and their usage.
