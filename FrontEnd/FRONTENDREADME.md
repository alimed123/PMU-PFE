# PMU Dashboard Frontend

This is the **React + Vite** frontend for the PMU (Phasor Measurement Unit) Dashboard. It provides real-time visualization, monitoring, and alerting for PMU data retrieved from the backend FastAPI service.

---

## Features

- **User Authentication** (simple local login)
- **Dashboard** with real-time power metrics and phasor diagrams
- **Events Table** for recent PMU measurements
- **Graphs** for time series and scatter plots (P, Q, PF, V, I)
- **Notifications** for abnormal voltage/current (WebSocket alerts)
- **Protocol Switching** (UDP/TCP)
- **Responsive UI** styled with Tailwind CSS

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- The backend FastAPI service running (see [../Backend/Backend README.md](../Backend/Backend%20README.md))

---

## Installation

1. **Clone the repository** (if you haven't already):

    ```sh
    git clone <your-repo-url>
    cd PMU-PFE/FrontEnd
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

---

## Running the Development Server

Start the frontend in development mode (with hot reload):

```sh
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)  
Make sure the backend is running at [http://localhost:8000](http://localhost:8000)

---

## Building for Production

To build the optimized production bundle:

```sh
npm run build
```

The output will be in the `dist/` folder.

To preview the production build locally:

```sh
npm run preview
```

---

## Project Structure

```
FrontEnd/
├── public/           # Static assets (alert.mp3, images, etc.)
├── src/
│   ├── components/   # Reusable React components
│   ├── Pages/        # Main page components (Dashboard, Events, Graphs, etc.)
│   ├── App.jsx       # Main app entry
│   ├── main.jsx      # ReactDOM entry point
│   └── index.css     # Tailwind and global styles
├── package.json
├── tailwind.config.js
├── vite.config.js
└── ...
```

---

## Environment & Configuration

- API URLs are hardcoded for development (`http://localhost:8000`). Change them in the source if your backend runs elsewhere.
- WebSocket for alerts: `ws://localhost:8000/ws/alerts`
- Static files (e.g., `alert.mp3`) should be placed in the `public/` directory.

---

## Usage

### Login

- **Username:** `inelec`
- **Password:** `inelec123`

### Navigate

Use the top navigation bar to access Dashboard, Events, Graphs, and Notifications.

#### Dashboard

- View real-time power metrics and phasor diagrams.
- Change PMU, protocol, timeline, or phase using the dropdowns.

#### Events

- View recent PMU measurement events in a table.

#### Graphs

- Visualize time series and scatter plots for selected PMU and phases.

#### Notifications

- See real-time alerts for abnormal voltage/current.

---

## Customization

**Styling:**  
Tailwind CSS is used for styling. Modify `tailwind.config.js` and `src/index.css` as needed.

**Assets:**  
Place custom images or sounds in the `public/` or `src/assets/` folders.

---

## Troubleshooting

- **CORS errors:**  
  Ensure the backend allows requests from `http://localhost:5173`.

- **WebSocket issues:**  
  Make sure the backend is running and accessible at `ws://localhost:8000/ws/alerts`.

- **API errors:**  
  Check backend logs and ensure `.env` is configured correctly for InfluxDB.

---

## License

MIT License

---

## Authors

- Mohamed Ali Saboundji
- Ramzi Hechaichi