"""This file is the simulator engine for CNC machine factories dealing with the factories machines, sensors and KG's"""
#Imports
import random
import time
import json
import os
import csv

#-------- Compnonents and sensor classes --------
"""In this section there is the senor class which acts as a base template for the other compnent classes, they inherrit
sensor class and then when reading the components they return a value generated from their ranges and options"""

class Sensor:
    def __init__(self, name:str):
        self.name = name

    #Raises not implemented as this is base case and doesn't represent one sensor but a base for all sensors
    def read(self):
        raise NotImplementedError

class SpindleTempSensor(Sensor):
    def read(self):
        return round(random.uniform(45, 100), 2)

class VibrationSensor(Sensor):
    def read(self):
        return round(random.uniform(0.2, 4.0), 2)

class PowerDrawSensor(Sensor):
    def read(self):
        return round(random.uniform(200, 450), 1)

class PositionEncoder(Sensor):
    def read(self):
        #Return dict for clarity
        return {
            "X": round(random.uniform(0, 100), 1),
            "Y": round(random.uniform(0, 100), 1),
            "Z": round(random.uniform(0, 50), 1),
        }

class VisionQCSensor(Sensor):
    def read(self):
        #Tests either pass or fail for quality control
        return random.choice(["PASS", "FAIL"])

class AutomaticToolChanger:
    def __init__(self, tools: list[int]):
        self.tools = tools
        self.current_tool = tools[0]

    def check_and_change_tool(self, cycle_id: int):
        #Checks every 10th cycle and changes tool (this can be changed at a later date)
        if cycle_id % 10 == 0:
            self.current_tool = random.choice(self.tools)
        return self.current_tool
    
#-------- Machine classes --------
"""This section a similar theme as above is happening where I have made a machine base class and from
there have used this and inherited it into other classes for the other 4 machines in the factory"""

class Machine:
    def __init__(self, name: str):
        self.name = name

    #Raises not implemented as this is base case and doesn't represent one machine but a base for all machine
    def perform_operation(self, cycle_id: int):
        raise NotImplementedError

class CNCMill(Machine):
    def __init__(self, name: str, atc: AutomaticToolChanger):
        super().__init__(name)
        self.atc = atc

    #Operations for CNC are as below, cutting, drilling or idle
    def perform_operation(self, cycle_id: int):
        #Ramdomises the operation
        op = random.choice(["cutting", "drilling", "idle"])
        #Fetches tool number from function that randomises every 10th cycle from atc list
        tool = self.atc.check_and_change_tool(cycle_id)
        return {
            "operation": op,
            "tool_id": tool
        }

#Think about later
class RoboticArm(Machine):
    def perform_operation(self, cycle_id: int):
        #Randomises task from options in the list
        task = random.choice(["load_material", "unload_part", "assemble_component", "idle"])
        return {
            "robotic_arm_task": task
        }

#Think about later
class ConveyorBelt(Machine):
    def perform_operation(self, cycle_id: int):
        #Simulate part movement and tracking
        position = random.choice(["Station A", "Station B", "Inspection", "Exit"])
        part_id = f"PART-{1000 + cycle_id}"
        return {
            "conveyor_position": position,
            "part_id": part_id
        }

#Think about later
class InspectionSystem(Machine):
    def perform_operation(self, cycle_id: int):
        #Decides if part is in good condition and to what degree
        decision = random.choice(["PASS", "FAIL"])
        confidence = round(random.uniform(0.7, 1.0), 2)
        return {
            "inspection_result": decision,
            "inspection_confidence": confidence
        }

#-------- Message class --------
"""The section below takes inputs and transforms to document"""

class SimulationMessage:
    #All information listed in the format below
    def __init__(self, cycle_id: int, machine_data: dict, sensor_readings: dict):
        self.cycle_id = cycle_id
        self.timestamp = time.time()
        self.machine = machine_data
        self.sensors = sensor_readings

    #Json output below
    def to_json(self):
        payload = {
            "cycle_id": self.cycle_id,
            "timestamp": self.timestamp,
            **self.machine,
            **self.sensors
        }
        return json.dumps(payload)

#-------- Engine --------
"""This section manages creating the factory that holds the machines and sensors, it also has an
option between simulation data and real data"""

#Creates CNC object containing machines and sensors
class CNCFactory:
    def __init__(self, machines:list[Machine], sensors:list[Sensor]):
        self.machines = machines
        self.sensors = sensors

    #Option for data selection
    def get_data_source(self):
        #Fetches enviroment variable mode, if it doesn't exist then data is SIM
        mode = os.getenv("MODE", "SIM")
        #Reading real data
        if mode == "REAL":
            return self.read_real_data()
        #Reading SIM data
        else:
            return None

    #Fetches REAL data
    def read_real_data(self):
        #Example data below/placeholder
        return {
            "operation": "cutting",
            "tool_id": 2,
            "spindle_temp": 82.5,
            "vibration": 1.1,
            "power_draw": 310.2,
            "position": {"X": 50.0, "Y": 30.0, "Z": 10.0},
            "inspection": "PASS",
        }

    #Runs cycles for the simulaton
    def run_cycle(self, cycle_id: int):
        #1. Machine operations (loops through machines and completes any operations)
        machine_data = {}
        for m in self.machines:
            machine_data.update(m.perform_operation(cycle_id))

        #2. Sensor readings (reads sensors or if real-data is over-riden then use that)
        sensor_readings = {}
        #Real-data override?
        real = self.get_data_source()
        if real:
            sensor_readings = {
                "spindle_temp": real["spindle_temp"],
                "vibration": real["vibration"],
                "power_draw": real["power_draw"],
                "position": real["position"],
                "inspection": real["inspection"],
            }
        else:
            for s in self.sensors:
                sensor_readings[s.name] = s.read()

        #3. Package & send (returns packages)
        msg = SimulationMessage(cycle_id, machine_data, sensor_readings)
        classification = classify_state(sensor_readings, machine_data)
        send_to_KG(msg.to_json(), classification)

# ---- KG Mapping & Output ----
#Not complete yet

def load_kg_csv(file_path):
    mapping = {}
    try:
        with open(file_path, mode='r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            for row in reader:
                source = row["Source entity"].strip()
                mapping[source] = {
                    "relationship": row["relationship"].strip(),
                    "target_entity": row["target entity"].strip()
                }
    except FileNotFoundError:
        print(f"[WARNING] KG file not found: {file_path}")
    return mapping

#Load all KG mappings
maintenance_map = load_kg_csv("maintenance-kg.csv")
normal_map = load_kg_csv("normal-kg.csv")
cyberattack_map = load_kg_csv("cyberattack-kg.csv")

print(maintenance_map)
print(normal_map)
print(cyberattack_map)


def classify_state(sensors: dict, machine: dict):
    #Overheating check
    if sensors["spindle_temp"] < 75:
        return "Normal_KG:Temperature_Normal"
    elif sensors["spindle_temp"] > 75 and sensors["spindle_temp"] <= 90:
        return "Maintenance_KG:Possible_Overheating"
    elif sensors["spindle_temp"] > 90:
        #Glitch/firmware injection check
        if sensors["power_draw"] > 350 and sensors["power_draw"] < 400:
            return "Cyberattack_KG:Possible_Glitch/Firmware"
        elif sensors["power_draw"] >= 400:
            return "Cyberattack_KG:Likely_Glitch/Firmware"
        #Overheat message return
        else:
            return "Maintenance_KG:Spindle_Overheat"
        
    #Vibration sabotage
    if sensors["vibration"] < 1.5:
        return "Normal_KG:Vibration_Normal"
    elif sensors["vibration"] > 1.5 and sensors["vibration"] <= 3.5:
        return "Cyberattack_KG:Possible_Vibration_Sabotage"
    elif sensors["vibration"] > 3.5:
        return "Cyberattack_KG:Likely_Vibration_Sabotage"
    
    #Power draw detection
    if sensors["power_draw"] < 350:
        return "Normal_KG:Normal_Power_Consumption"
    elif sensors["power_draw"] >= 350 and sensors["power_draw"] < 400:
        return "PowerDraw_KG:Possible_Elevated_Load"
    elif sensors["power_draw"] >= 400:
        return "PowerDraw_KG:High_Power_Consumption"
    
    #Position encoder
    EXPECTED_POSITION = {"X": 50.0, "Y": 30.0, "Z": 10.0}
    #mm difference for warning
    TOLERANCE_WARNING = 5.0
    #mm difference for fault
    TOLERANCE_CRITICAL = 10.0
    pos = sensors["position"]
    max_dev = max(abs(pos[axis] - EXPECTED_POSITION[axis]) for axis in ["X", "Y", "Z"])    
    if max_dev < TOLERANCE_WARNING and max_dev > TOLERANCE_CRITICAL:
        return "Normal_KG:Position_Encoder_Good"
    elif max_dev > TOLERANCE_WARNING and max_dev <= TOLERANCE_CRITICAL:
        return "Maintenance_KG:Minor_Position_Drift"
    elif max_dev > TOLERANCE_CRITICAL:
        return "Cyberattack_KG:Major_Position_Change"
    
    #Tool change
    if machine.get("tool_id") and machine["tool_id"] not in [1, 2, 3]:
        return "Maintenance_KG:Tool_Change"
    
    #Inspection system
    if sensors["inspection"] == "FAIL":
        return "Normal_KG:Inspection_Fail"
    return "Normal_KG:Operation_Normal"

def send_to_KG(payload_json: str, classification: str):
    record = json.loads(payload_json)
    record["kg_node"] = classification
    #Replace with HTTP POST or message queue in real use
    #print(json.dumps(record)) 
    triple = None
    if "Maintenance_KG" in classification:
        triple = maintenance_map.get(classification)
    elif "Normal_KG" in classification:
        triple = normal_map.get(classification)
    elif "Cyberattack_KG" in classification:
        triple = cyberattack_map.get(classification)
    record["kg_triple"] = triple
    print(json.dumps(record))

# ---- Main Execution ----

#Main program loop
if __name__ == "__main__":
    #Amount of cycles wanted
    NUM_CYCLES  = 5
    #Seconds
    CYCLE_DELAY = 1  

    #List of sensors
    sensors = [
        SpindleTempSensor("spindle_temp"),
        VibrationSensor("vibration"),
        PowerDrawSensor("power_draw"),
        PositionEncoder("position"),
        VisionQCSensor("inspection"),
    ]

    #Tools
    atc = AutomaticToolChanger([1, 2, 3, 4, 5])

#List of machines
machines = [
    CNCMill("CNC_Mill_1", atc),
    RoboticArm("Robotic_Arm_1"),
    ConveyorBelt("Conveyor_1"),
    InspectionSystem("Inspection_Station")
]

#Instantiating factory using list of machines and sensory
factory = CNCFactory(machines, sensors)

#Loops through cycles
for cycle in range(1, NUM_CYCLES + 1):
    #Runs simulation cycle
    factory.run_cycle(cycle)
    time.sleep(CYCLE_DELAY)
