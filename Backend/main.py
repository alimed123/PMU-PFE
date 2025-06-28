from fastapi import FastAPI, HTTPException, Query
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS
from typing import Optional,List
import asyncio

import os
from dotenv import load_dotenv
import math

load_dotenv()
VOLTAGE_MIN = 220
VOLTAGE_MAX = 221
CURRENT_MAX = 100  # You define what is "too much"


app = FastAPI()

# CORS setup: allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# InfluxDB config
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")  # Default to localhost if not set
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
INFLUX_ORG = os.getenv("INFLUX_ORG", "")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "")

client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG
)

query_api = client.query_api()

#Retrieves aggregated phasor measurements
@app.get(
    "/api/power_timeseries",
    summary="Get power time series",
    description="Retrieves aggregated phasor measurements (voltage and current magnitudes and angles) for a specified PMU over a time window. Calculates P, Q, S, and power factor for each phase and totals."
)
def get_power_timeseries(
    pmu: str = Query("1"),
    start: str = Query("-1h"),
    window: str = Query("10s"),
):
    # Query all phasor magnitudes and angles for all phases
    fields = [
        "v_a_mag", "i_a_mag", "v_a_ang", "i_a_ang",
        "v_b_mag", "i_b_mag", "v_b_ang", "i_b_ang",
        "v_c_mag", "i_c_mag", "v_c_ang", "i_c_ang"
    ]
    fields_filter = " or ".join([f'r["_field"] == "{field}"' for field in fields])

    flux_query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: {start})
      |> filter(fn: (r) => r["_measurement"] == "pmu_measurements")
      |> filter(fn: (r) => r["pmu_id"] == "{pmu}")
      |> filter(fn: (r) => {fields_filter})
      |> aggregateWindow(every: {window}, fn: mean, createEmpty: false)
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> keep(columns: ["_time", {", ".join([f'"{field}"' for field in fields])}])
    '''
    try:
        tables = query_api.query(flux_query)
        points = []
        for table in tables:
            for record in table.records:
                row = record.values
                out = {}
                # Time
                out["time"] = row["_time"].isoformat() if "_time" in row else None

                # For each phase, try to compute P, Q, PF if all fields exist
                total_P = total_Q = total_S = total_cos = count = 0
                for ph in ["a", "b", "c"]:
                    V = row.get(f"v_{ph}_mag")
                    I = row.get(f"i_{ph}_mag")
                    v_ang = row.get(f"v_{ph}_ang")
                    i_ang = row.get(f"i_{ph}_ang")
                    if all(x is not None for x in [V, I, v_ang, i_ang]):
                        phi = math.radians(float(v_ang) - float(i_ang))
                        S = float(V) * float(I)
                        P = S * math.cos(phi)
                        Q = S * math.sin(phi)
                        PF = math.cos(phi)
                        out[f"P_{ph.upper()}"] = P
                        out[f"Q_{ph.upper()}"] = Q
                        out[f"PF_{ph.upper()}"] = PF
                        # Add voltage values
                        out[f"V_{ph.upper()}"] = float(V)
                        total_P += P
                        total_Q += Q
                        total_S += S
                        total_cos += PF
                        count += 1
                    # Also provide current for plotting
                    if I is not None:
                        out[f"I_{ph.upper()}"] = I

                # Optionally provide total P, Q, S, PF
                if count > 0:
                    out["P"] = total_P
                    out["Q"] = total_Q
                    out["S"] = total_S
                    out["PF"] = total_cos / count if total_S != 0 else 0
                points.append(out)
        return points
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"InfluxDB query failed: {str(e)}")

#Change config ini file protocol
@app.post("/api/changeprotocol")
def change_protocol(protocol: str):
    try:
        with open('config.ini', 'w') as f:
            f.write(f'protocol_used = {protocol}')
        return {"message": f"Protocol changed to {protocol}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update config: {str(e)}")

# WebSocket endpoint for real-time alerts
@app.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            alerts = []

            query = f'''
            from(bucket: "{INFLUX_BUCKET}")
              |> range(start: -15s)
              |> filter(fn: (r) => r._measurement == "pmu_measurements")
              |> last()
            '''
            tables = query_api.query(query)
            for table in tables:
                for row in table.records:
                    print(row.values)
                    pmu_id = row.values.get("pmu_id")
                    field = row.get_field()
                    value = row.get_value()
                    if field.startswith("v") and (value < VOLTAGE_MIN or value > VOLTAGE_MAX):
                        alerts.append({"pmu": pmu_id, "type": "voltage", "value": value})
                    elif field.startswith("i") and value > CURRENT_MAX:
                        alerts.append({"pmu": pmu_id, "type": "current", "value": value})

            if alerts:
                await websocket.send_json(alerts)

            await asyncio.sleep(5)  # Poll interval
    except Exception as e:
        print("WebSocket closed or errored:", e)
        await websocket.close()

# Retrieves power quantities for a specific PMU and phasor type
# Calculates S, P, Q, and power factor based on voltage and current magnitudes and
@app.get("/api/power_a")
def get_power_quantities(
    pmu: str = Query(..., description="PMU ID to filter data"),
    phasor: str = Query(..., description="Phasor type (e.g., 'a', 'b', 'c')"),
    start: str = Query(..., description="Start time (e.g., -1h, -15m, 2023-10-01T00:00:00Z)"),
):
    flux_query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: {start})
        |> filter(fn: (r) => r["_measurement"] == "pmu_measurements")
        |> filter(fn: (r) => r["pmu_id"] == "{pmu}")
        |> filter(fn: (r) => r["_field"] == "i_a_mag" or
        r["_field"] == "i_a_ang" or
        r["_field"] == "i_b_ang" or
        r["_field"] == "i_b_mag" or 
        r["_field"] == "i_c_ang" or 
        r["_field"] == "i_c_mag" or 
        r["_field"] == "v_a_ang" or 
        r["_field"] == "v_a_mag" or 
        r["_field"] == "v_b_ang" or 
        r["_field"] == "v_b_mag" or 
        r["_field"] == "v_c_ang" or 
        r["_field"] == "v_c_mag")

        |> aggregateWindow(every: 1s, fn: mean, createEmpty: false)
        |> yield(name: "mean")
        
    '''
    try:
        tables = query_api.query(flux_query)
        values = {}
        for table in tables:
            for record in table.records:
                values[record.get_field()] = record.get_value()
        required = ["v_a_mag", "v_a_ang", "i_a_mag", "i_a_ang","v_b_ang", "v_b_mag", "v_c_ang", "v_c_mag", "i_b_ang", "i_b_mag", "i_c_ang", "i_c_mag"]
        if not all(field in values for field in required):
            raise HTTPException(status_code=404, detail=f"Missing fields in DB for PMU {pmu}")
        # Calculate power quantities
        if phasor == "a":
            V = float(values["v_a_mag"])
            I = float(values["i_a_mag"])
            v_angle = float(values["v_a_ang"])
            i_angle = float(values["i_a_ang"])
            # Angle difference in degrees, convert to radians
            phi = math.radians(v_angle - i_angle)
        elif phasor == "b":
            V = float(values["v_b_mag"])
            I = float(values["i_b_mag"])
            v_angle = float(values["v_b_ang"])
            i_angle = float(values["i_b_ang"])
            phi = math.radians(v_angle - i_angle)
        elif phasor == "c":
            V = float(values["v_c_mag"])
            I = float(values["i_c_mag"])
            v_angle = float(values["v_c_ang"])
            i_angle = float(values["i_c_ang"])
            phi = math.radians(v_angle - i_angle)

        S = V * I
        P = S * math.cos(phi)
        Q = S * math.sin(phi)
        PF = math.cos(phi)

        return {
            "pmu_id": pmu,
            "v_a_ang":float(values["v_a_ang"]),
            "v_b_ang":float(values["v_b_ang"]),
            "v_c_ang":float(values["v_c_ang"]),
            "i_a_ang":float(values["i_a_ang"]),
            "i_b_ang":float(values["i_b_ang"]),
            "i_c_ang":float(values["i_c_ang"]),
            "V": V,
            "I": I,
            "phi_deg": v_angle - i_angle,
            "S": S,
            "P": P,
            "Q": Q,
            "PF": PF
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"InfluxDB query failed: {str(e)}")
    
#Get pmu ids
@app.get("/api/getpmus")
def get_pmus():
    """
    Get list of PMUs from InfluxDB.
    """
    flux_query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: -10m)
        |> filter(fn: (r) => r["_measurement"] == "pmu_measurements")
        |> keep(columns: ["pmu_id"])   // Keep only the pmu_name column
        |> distinct(column: "pmu_id")  // Get unique PMU names
    '''
    try:
        tables = query_api.query(flux_query)
        pmus = [record.values["pmu_id"] for table in tables for record in table.records]
        return {"pmus": pmus}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"InfluxDB query failed: {str(e)}")

#Get Data Measurments for events showing
@app.get("/api/data")
def get_data(
    pmu: str = Query(..., description="PMU ID to filter data"),
    start: str = Query(..., description="Start time (e.g., -1h, -15m, 2023-10-01T00:00:00Z)"),
    stop: Optional[str] = Query(None, description="Stop time (optional, defaults to now)")
):
    # Validate start format (basic check)
    if not start or not any(char.isdigit() for char in start):
        raise HTTPException(status_code=400, detail="Invalid start time format.")

    range_clause = f'|> range(start: {start}'
    if stop:
        range_clause += f', stop: {stop}'
    range_clause += ')'

    # Select both magnitude and angle fields for voltages and currents
    fields = [
        "v_a_mag", "v_b_mag", "v_c_mag",
        "i_a_mag", "i_b_mag", "i_c_mag",
        "v_a_ang", "v_b_ang", "v_c_ang",
        "i_a_ang", "i_b_ang", "i_c_ang"
    ]
    fields_filter = " or ".join([f'r["_field"] == "{field}"' for field in fields])

    flux_query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: {start})
        |> filter(fn: (r) => r["_measurement"] == "pmu_measurements")
        |> filter(fn: (r) => r["pmu_id"] == "{pmu}")
        |> filter(fn: (r) => {fields_filter})
        |> aggregateWindow(every: 10ms, fn: mean, createEmpty: false)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> keep(columns: ["_time", {", ".join([f'"{field}"' for field in fields])}])
    '''

    try:
        tables = query_api.query(flux_query)
        results = []
        for table in tables:
            for record in table.records:
                row = record.values
                results.append({
                    "time": row["_time"].isoformat() if "_time" in row else None,
                    "v_a": row.get("v_a_mag"),
                    "v_b": row.get("v_b_mag"),
                    "v_c": row.get("v_c_mag"),
                    "i_a": row.get("i_a_mag"),
                    "i_b": row.get("i_b_mag"),
                    "i_c": row.get("i_c_mag"),
                    "v_a_ang": row.get("v_a_ang"),
                    "v_b_ang": row.get("v_b_ang"),
                    "v_c_ang": row.get("v_c_ang"),
                    "i_a_ang": row.get("i_a_ang"),
                    "i_b_ang": row.get("i_b_ang"),
                    "i_c_ang": row.get("i_c_ang"),
                })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"InfluxDB query failed: {str(e)}")