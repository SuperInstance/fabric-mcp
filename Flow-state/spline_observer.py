import os
import json
import time
import glob
from datetime import datetime
from pathlib import Path

# --- CONFIGURATION ---
TZPRO_CAPTURES_DIR = "/c/Users/casey/polln/tzpro-agent/captures/v3"
FLOW_STATE_TRACE_DIR = "/c/Users/casey/polln/Flow-state/traces/tzpro_analysis/10min"
OBSERVER_ID = "Spline-Observer-V1"

# --- CORE LOGIC ---

class SplineObserver:
    def __init__(self, capture_dir, trace_dir, observer_id):
        self.capture_dir = Path(capture_dir)
        self.trace_dir = Path(trace_dir)
        self.observer_id = observer_id
        self.processed_files = set()
        
        os.makedirs(self.trace_dir, exist_ok=True)
        print(f"[{datetime.now().isoformat()}] [OBSERVER] Initialized. Monitoring {self.capture_dir}")

    def analyze_capture(self, json_path):
        """
        Simulates high-fidelity feature extraction from a capture JSON.
        In production, this would parse the actual metadata and potentially 
        perform computer vision on the associated PNG.
        """
        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
            
            # Extract core realization
            analysis = {
                "observer_id": self.observer_id,
                "timestamp": data.get("ts", datetime.now().isoformat()),
                "source_capture": str(json_path.name),
                "features": {
                    "visual_density": 0.45,  # Mocked
                    "signal_noise_ratio": 0.88, # Mocked
                    "momentum_vector": 1.2, # Mocked
                    "entropy": 0.12 # Mocked
                },
                "provenance": {
                    "origin_system": "TZ-PRO-AGENT",
                    "capture_mode": "automated"
                }
            }
            return analysis
        except Exception as e:
            print(f"Error analyzing {json_path}: {e}")
            return None

    def run_cycle(self):
        """One iteration of the observer loop."""
        # Find all .json files in the capture directory (recursively)
        capture_files = sorted(glob.glob(str(self.capture_dir / "**/*.json"), recursive=True))
        
        new_captures = 0
        for cap_path_str in capture_files:
            cap_path = Path(cap_path_str)
            
            if cap_path not in self.processed_files:
                print(f"[{datetime.now().isoformat()}] [OBSERVER] New capture detected: {cap_path.name}")
                
                observation = self.analyze_capture(cap_path)
                if observation:
                    # Save to trace manifold
                    trace_name = f"trace_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{cap_path.stem}.json"
                    trace_path = self.trace_dir / trace_name
                    
                    with open(trace_path, 'w') as tf:
                        json.dump(observation, tf, indent=2)
                    
                    print(f"[{datetime.now().isoformat()}] [OBSERVER] Trace generated: {trace_name}")
                    self.processed_files.add(cap_path)
                    new_captures += 1
        
        return new_captures

# --- TEST SUITE ---

def run_test_environment():
    print("--- STARTING TEST ENVIRONMENT ---")
    test_root = Path("/c/Users/casey/polln/test_spline_observer")
    test_capture = test_root / "captures"
    test_trace = test_root / "traces"
    
    os.makedirs(test_capture, exist_ok=True)
    os.makedirs(test_trace, exist_ok=True)

    # 1. Create Mock Capture Data
    mock_data = {
        "ts": datetime.now().isoformat(),
        "position": {"lat": 55.7, "lon": -131.6},
        "analysis": {"depth_fm": 55.2}
    }
    
    mock_filename = "mock_capture_001.json"
    with open(test_capture / mock_filename, 'w') as f:
        json.dump(mock_data, f)
    
    print(f"Created mock capture: {mock_filename}")

    # 2. Run Observer
    observer = SplineObserver(test_capture, test_trace, "TEST_OBSERVER")
    count = observer.run_cycle()
    
    # 3. Verify Results
    print(f"Cycle complete. New traces: {count}")
    
    trace_files = list(test_trace.glob("*.json"))
    if count > 0 and len(trace_files) > 0:
        print("SUCCESS: Test trace generated.")
        with open(trace_files[0], 'r') as f:
            result = json.load(f)
            print(f"Verified Trace Content: {result['features']}")
    else:
        print("FAILURE: No trace was generated.")
        exit(1)

    print("--- TEST ENVIRONMENT CLEANUP ---")
    # shutil.rmtree(test_root) # Uncomment to clean up after tests

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        run_test_environment()
    else:
        # In production mode, this runs as a daemon
        observer = SplineObserver(TZPRO_CAPTURES_DIR, FLOW_STATE_TRACE_DIR, OBSERVER_ID)
        while True:
            observer.run_cycle()
            time.sleep(10) # Polling interval
