# PMU-PDC Simulator Documentation

This folder contains two Python notebooks simulating a **Phasor Measurement Unit (PMU)** and a **Phasor Data Concentrator (PDC)**. These tools are designed to generate, transmit, receive, and store realistic PMU data for testing and development purposes.

---

## Contents

- [Overview](#overview)
- [Files](#files)
- [PMU SIM.ipynb](#pmu-simipynb)
  - [Purpose](#purpose)
  - [How It Works](#how-it-works)
  - [Configuration](#configuration)
  - [Usage](#usage)
- [PDC SIM.ipynb](#pdc-simipynb)
  - [Purpose](#purpose-1)
  - [How It Works](#how-it-works-1)
  - [Configuration](#configuration-1)
  - [Usage](#usage-1)
- [Data Format](#data-format)
- [Protocol and Mode Selection](#protocol-and-mode-selection)
- [Environment Variables](#environment-variables)
- [Notes](#notes)

---

## Overview

- **PMU SIM**: Simulates a PMU device, reading phasor data from a CSV file and sending it to a PDC over TCP or UDP.
- **PDC SIM**: Simulates a PDC, receiving data from multiple PMUs, batching and writing it to InfluxDB.

---

## Files

- `PMU SIM.ipynb` — PMU simulator notebook.
- `PDC SIM.ipynb` — PDC simulator notebook.
- `.env` — Environment variables for InfluxDB connection.
- `realistic_pmu_train.csv` — Example CSV file with phasor data (not included, provide your own).
- `ReadmeSIM.md` — This documentation.

---

## PMU SIM.ipynb

### Purpose

Simulates a PMU device by sending time-series phasor data to a PDC using either TCP or UDP. Useful for testing PDC and backend ingestion.

### How It Works

- Reads phasor data from a CSV file.
- Packs each row into a binary structure:  
  `>Id12f` (PMU_ID, timestamp, 12 floats for phasors).
- Sends packets at a configurable interval to the PDC.
- Protocol (TCP/UDP) and experiment mode can be set via a config file or user input.

### Configuration

- **PMU_ID**: Unique integer for this PMU.
- **PDC_IP**: IP address of the PDC (default: `192.168.60.100`).
- **PDC_PORT**: Port of the PDC (default: `9009`).
- **CSV_FILE**: Path to CSV file with phasor data.
- **SEND_INTERVAL**: Time between packets (seconds).
- **STRUCT_FORMAT**: Packet structure (`>Id12f`).

### Usage

1. Edit the configuration variables at the top of the notebook as needed.
2. Place your CSV file in the same directory or update `CSV_FILE`.
3. (Optional) Create a `config.ini` file with:
    ```
    protocol=TCP
    mode=1
    ```
4. Run the notebook.  
   If no config file is found, you will be prompted to select protocol and mode.
5. The PMU will send data to the PDC at the specified interval.

---

## PDC SIM.ipynb

### Purpose

Simulates a PDC that receives data from multiple PMUs, batches it, and writes it to InfluxDB for storage and later analysis.

### How It Works

- Listens for incoming PMU packets on TCP or UDP.
- Supports multiple experiment modes (batching, real-time, etc.).
- Unpacks each packet, extracts PMU ID, timestamp, and phasor values.
- Buffers data by timestamp and writes to InfluxDB when all expected PMUs have sent data for a given timestamp.
- Uses environment variables for InfluxDB connection.

### Configuration

- **INFLUXDB_URL**: InfluxDB server URL.
- **INFLUXDB_TOKEN**: InfluxDB API token.
- **INFLUXDB_ORG**: InfluxDB organization.
- **INFLUXDB_BUCKET**: InfluxDB bucket for data.
- **PACKET_FORMAT**: `>Id12f` (same as PMU).
- **EXPECTED_PMUS**: Set of expected PMU IDs (default: 1–9).

### Usage

1. Set up your `.env` file with InfluxDB credentials.
2. (Optional) Create a `config.ini` file with:
    ```
    protocol=TCP
    mode=1
    ```
3. Run the notebook.
4. Select protocol and experiment mode if prompted.
5. The PDC will listen for incoming PMU data and write to InfluxDB.

---

## Data Format

Each PMU packet contains:

- **PMU_ID**: Integer
- **Timestamp**: Float (seconds since epoch)
- **Phasor values**: 12 floats in the order:
  - `v_a_mag`, `v_a_ang`, `v_b_mag`, `v_b_ang`, `v_c_mag`, `v_c_ang`
  - `i_a_mag`, `i_a_ang`, `i_b_mag`, `i_b_ang`, `i_c_mag`, `i_c_ang`

---

## Protocol and Mode Selection

- **Protocol**:  
  - `TCP`: Reliable, connection-oriented.
  - `UDP`: Faster, connectionless.
- **Mode**:  
  - `1`: Real-time batch (write every N PMU packets, struct compressed)
  - `2`: Real-time (write each packet as it arrives)
  - `3`: CSV line mode (for plain text CSV over UDP)

You can set these in `config.ini` or via interactive prompt.

---

## Environment Variables

Create a `.env` file with:

```
INFLUXDB_URL=...
INFLUXDB_TOKEN=...
INFLUXDB_ORG=...
INFLUXDB_BUCKET=...
```

---

## Notes

- Both simulators are designed for local testing and development.
- Make sure the PDC is running before starting the PMU.
- The PMU and PDC must use the same protocol and packet format.
- For realistic testing, run multiple instances of PMU SIM with different `PMU_ID`s.

---

**Authors:**  
- Mohamed Ali Saboundji  
- Ramzi Hechaichi

MIT License
