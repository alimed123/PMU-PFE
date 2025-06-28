# PMU Backend Service

This backend provides a **FastAPI-based REST and WebSocket API** for retrieving and processing PMU (Phasor Measurement Unit) data from InfluxDB. It supports power calculations, real-time alerts, and protocol configuration.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Backend](#running-the-backend)
- [API Endpoints](#api-endpoints)
- [WebSocket Alerts](#websocket-alerts)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Authors](#authors)

---

## Features

- Retrieve power time series and phasor measurements
- Calculate real, reactive, apparent power, and power factor
- Real-time alerts via WebSocket for voltage/current anomalies
- Change protocol via API
- List available PMUs

---

## Requirements

- Python 3.8+
- [InfluxDB 2.x](https://docs.influxdata.com/influxdb/v2.0/install/)
- (Optional) [pipenv](https://pipenv.pypa.io/en/latest/) or [virtualenv](https://virtualenv.pypa.io/en/latest/)

---

## Installation

1. **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd Backend
    ```

2. **Create and activate a virtual environment (recommended):**
    ```sh
    python -m venv venv
    venv\Scripts\activate
    ```

3. **Install dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

---

## Configuration

1. **Environment Variables**

    Create a `.env` file in the project root with the following variables:

    ```
    INFLUX_URL=
    INFLUX_TOKEN=
    INFLUX_ORG=
    INFLUX_BUCKET=
    ```

    Replace values as needed for your InfluxDB setup.

2. **(Optional) Protocol Configuration**

    The backend uses a `config.ini` file to store the current protocol. This file will be created/updated automatically via the `/api/changeprotocol` endpoint.

---

## Running the Backend

1. **Start the FastAPI server:**
    ```sh
    uvicorn main:app --reload
    ```

    The API will be available at: [http://localhost:8000](http://localhost:8000)  
    Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

- `GET /api/power_timeseries`  
  Retrieve aggregated phasor measurements and power calculations.

- `POST /api/changeprotocol`  
  Change the protocol used by the backend.

- `GET /api/power_a`  
  Get power quantities for a specific PMU and phasor.

- `GET /api/getpmus`  
  List available PMU IDs.

- `GET /api/data`  
  Get raw measurement data for events display.

See [http://localhost:8000/docs](http://localhost:8000/docs) for full details and parameters.

---

## WebSocket Alerts

Connect to `ws://localhost:8000/ws/alerts` for real-time alerts about voltage/current anomalies.

---

## Troubleshooting

**InfluxDB connection errors:**  
Ensure your `.env` variables are correct and InfluxDB is running and accessible.

**CORS issues:**  
The backend is configured for a React frontend at `http://localhost:5173`. Update `allow_origins` in `main.py` if needed.

**Missing dependencies:**  
Run `pip install -r requirements.txt` again.

---

## License

MIT License

---

## Authors

- Mohamed Ali Saboundji
- Ramzi Hechaichi
