# analytics_engine.py

import json
import time
import logging
from collections import deque
import statistics
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading


# --- Configuration ---
WINDOW_SIZE = 10
TEMP_THRESHOLD_WARN = 75
TEMP_THRESHOLD_CRIT = 90
TEMP_Z_LIMIT = 2.5

VIBRATION_WARN = 2.0
VIBRATION_CRIT = 3.5

POWER_WARN = 350
POWER_CRIT = 400

POSITION_EXPECTED = {"X": 50.0, "Y": 30.0, "Z": 10.0}
TOLERANCE_WARNING = 5.0
TOLERANCE_CRITICAL = 10.0

# Setup logging
logging.basicConfig(filename='anomaly_alerts.log', level=logging.INFO, format='%(asctime)s %(message)s')

# --- Global Data ---
metric_data = {}
alerts_buffer = []

# --- Helper Functions ---
def rolling_zscore(machine_id, metric, value):
    key = f"{machine_id}:{metric}"
    if key not in metric_data:
        metric_data[key] = deque(maxlen=WINDOW_SIZE)
    readings = metric_data[key]
    readings.append(value)
    if len(readings) < 5:
        return False, None
    mean = statistics.mean(readings)
    stdev = statistics.stdev(readings)
    if stdev == 0:
        return False, None
    z_score = (value - mean) / stdev
    if abs(z_score) > TEMP_Z_LIMIT:
        return True, {"mean": mean, "z": round(z_score, 2)}
    return False, None

# --- Detection Functions ---
def detect_temp(machine_id, temp):
    if temp > TEMP_THRESHOLD_CRIT:
        return {"type": "HIGH_TEMP", "severity": "CRITICAL"}
    elif temp > TEMP_THRESHOLD_WARN:
        return {"type": "HIGH_TEMP", "severity": "WARNING"}
    else:
        is_anom, _ = rolling_zscore(machine_id, "temp", temp)
        if is_anom:
            return {"type": "TEMP_Z_SPIKE", "severity": "WARNING"}
    return None

def detect_vibration(machine_id, vib):
    if vib > VIBRATION_CRIT:
        return {"type": "HIGH_VIBRATION", "severity": "CRITICAL"}
    elif vib > VIBRATION_WARN:
        return {"type": "HIGH_VIBRATION", "severity": "WARNING"}
    else:
        is_anom, _ = rolling_zscore(machine_id, "vibration", vib)
        if is_anom:
            return {"type": "VIBRATION_Z_SPIKE", "severity": "WARNING"}
    return None

def detect_power(machine_id, power):
    if power > POWER_CRIT:
        return {"type": "HIGH_POWER_DRAW", "severity": "CRITICAL"}
    elif power > POWER_WARN:
        return {"type": "HIGH_POWER_DRAW", "severity": "WARNING"}
    else:
        is_anom, _ = rolling_zscore(machine_id, "power", power)
        if is_anom:
            return {"type": "POWER_Z_SPIKE", "severity": "WARNING"}
    return None

def detect_position(machine_id, pos):
    max_dev = max(abs(pos[axis] - POSITION_EXPECTED[axis]) for axis in ["X", "Y", "Z"])
    if max_dev > TOLERANCE_CRITICAL:
        return {"type": "MAJOR_POSITION_DRIFT", "severity": "CRITICAL"}
    elif max_dev > TOLERANCE_WARNING:
        return {"type": "MINOR_POSITION_DRIFT", "severity": "WARNING"}
    return None

def detect_inspection(machine_id, result):
    key = f"{machine_id}:inspection_fails"
    if key not in metric_data:
        metric_data[key] = deque(maxlen=5)
    fails = metric_data[key]
    fails.append(result == "FAIL")
    if sum(fails) >= 3:
        return {"type": "REPEATED_INSPECTION_FAILS", "severity": "CRITICAL"}
    return None

# --- Alert Generation ---
def generate_aggregated_alert(machine_id, anomalies, cycle_id):
    overall_type = "MULTIPLE_ANOMALIES" if len(anomalies) > 1 else anomalies[0]["type"]
    alert = {
        "alert_type": overall_type,
        "machine": machine_id,
        "anomalies": anomalies,
        "cycle_id": cycle_id,
        "timestamp": time.time()
    }
    logging.info(f"ALERT: {json.dumps(alert)}")
    print(json.dumps(alert))  # optional
    alerts_buffer.append(alert)
    if len(alerts_buffer) > 50:
        alerts_buffer.pop(0)

# --- Processor ---
def process_simulation_output(sim_json: str):
    try:
        data = json.loads(sim_json)
        cycle_id = data.get("cycle_id")

        machine_id = data.get("machine")
        if not machine_id:
            print(f"[WARNING] Skipping data: missing 'machine' field. Payload: {sim_json}")
            return

        anomalies = []

        if "spindle_temp" in data:
            res = detect_temp(machine_id, data["spindle_temp"])
            if res: anomalies.append(res)

        if "vibration" in data:
            res = detect_vibration(machine_id, data["vibration"])
            if res: anomalies.append(res)

        if "power_draw" in data:
            res = detect_power(machine_id, data["power_draw"])
            if res: anomalies.append(res)

        if "position" in data:
            res = detect_position(machine_id, data["position"])
            if res: anomalies.append(res)

        if "inspection" in data:
            res = detect_inspection(machine_id, data["inspection"])
            if res: anomalies.append(res)

        if anomalies:
            generate_aggregated_alert(machine_id, anomalies, cycle_id)

    except json.JSONDecodeError:
        print("Skipped: malformed JSON")


# --- Flask App ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app)

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    response = jsonify(alerts_buffer)
    response.headers.add("Content-Type", "application/json")
    return response

@app.route("/api/process", methods=["POST"])
def process_input():
    sim_json = request.get_json()
    process_simulation_output(json.dumps(sim_json))
    return jsonify({"status": "ok"})

def start_flask():
    app.run(port=5001, debug=True, use_reloader=False)

# --- Main ---
def main():
    print("Analytics engine running on port 5001...")
    threading.Thread(target=start_flask, daemon=True).start()
    while True:
        time.sleep(1)  # keep main thread alive

if __name__ == "__main__":
    main()
