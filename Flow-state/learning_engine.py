import os
import json
import time
import glob
import numpy as np
from datetime import datetime
from pathlib import Path

# --- CONFIGURATION ---
TRACE_DIR = "/c/Users/casey/polln/Flow-state/traces/tzpro_analysis/10min"
LEARNING_MANIFEST_DIR = "/c/Users/casey/polln/Flow-state/learning_manifests"
ENTROPY_THRESHOLD = 0.25 
ROLLING_WINDOW_SIZE = 50 

class LearningEngine:
    def __init__(self, trace_dir, manifest_dir, threshold=0.25):
        self.trace_dir = Path(trace_dir)
        self.manifest_dir = Path(manifest_dir)
        self.threshold = threshold
        self.processed_traces = set()
        self.entropy_history = []
        
        os.makedirs(self.manifest_dir, exist_ok=True)
        print(f"[{datetime.now().isoformat()}] [LEARNING_ENGINE] Initialized. Monitoring {self.trace_dir}")

    def calculate_baseline(self):
        if len(self.entropy_history) < 5:
            return 0.0, 0.0
        return np.mean(self.entropy_history), np.std(self.entropy_history)

    def process_traces(self):
        trace_files = sorted(glob.glob(str(self.trace_dir / "*.json")))
        new_flags = 0
        for trace_path_str in trace_files:
            trace_path = Path(trace_path_str)
            if trace_path not in self.processed_traces:
                try:
                    with open(trace_path, 'r') as f:
                        data = json.load(f)
                    entropy = data.get("features", {}).get("entropy", 0.0)
                    self.entropy_history.append(entropy)
                    if len(self.entropy_history) > ROLLING_WINDOW_SIZE:
                        self.entropy_history.pop(0)
                    mean_e, std_e = self.calculate_baseline()
                    is_anomaly = False
                    if len(self.entropy_history) > 10:
                        if entropy > (mean_e + (2 * std_e)):
                            is_anomaly = True
                    if is_anomaly:
                        self.create_training_manifest(data, trace_path.name, entropy, mean_e)
                        new_flags += 1
                    self.processed_traces.add(trace_path)
                except Exception as e:
                    print(f"Error processing trace {trace_path}: {e}")
        return new_flags

    def create_training_manifest(self, original_data, source_file, entropy, mean_e):
        manifest_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        manifest_filename = f"high_entropy_batch_{manifest_id}.json"
        manifest_path = self.manifest_dir / manifest_filename
        manifest = {
            "manifest_id": manifest_id,
            "timestamp": datetime.now().isoformat(),
            "source_trace": source_file,
            "anomaly_metrics": {
                "measured_entropy": entropy,
                "baseline_mean": mean_e,
                "deviation_score": entropy - mean_e
            },
            "training_payload": original_data
        }
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        print(f"[{datetime.now().isoformat()}] [LEARNING_ENGINE] !!! ANOMALY DETECTED !!! Manifest: {manifest_filename}")

def run_test_environment():
    print("--- STARTING LEARNING ENGINE TEST ---")
    test_trace_dir = Path("/c/Users/casey/polln/test_learning_engine/traces")
    test_manifest_dir = Path("/c/Users/casey/polln/test_learning_engine/manifests")
    os.makedirs(test_trace_dir, exist_ok=True)
    os.makedirs(test_manifest_dir, exist_ok=True)
    engine = LearningEngine(test_trace_dir, test_manifest_dir)
    print("Seeding baseline entropy...")
    for i in range(20):
        t_path = test_trace_dir / f"normal_{i}.json"
        with open(t_path, 'w') as f:
            json.dump({"features": {"entropy": 0.1}}, f)
        engine.processed_traces.add(t_path)
        engine.entropy_history.append(0.1)
    anomaly_path = test_trace_dir / "anomaly_event.json"
    with open(anomaly_path, 'w') as f:
        json.dump({"features": {"entropy": 0.8}}, f)
    print("Injecting anomaly...")
    flags = engine.process_traces()
    if flags > 0:
        print(f"SUCCESS: Detected {flags} anomaly/ies.")
        manifests = list(test_manifest_dir.glob("*.json"))
        if manifests:
            print(f"Verified Manifest: {manifests[0].name}")
            with open(manifests[0], 'r') as f:
                m = json.load(f)
                print(f"Manifest Entropy: {m['anomaly_metrics']['measured_entropy']}")
        else:
            print("FAILURE: No manifest found.")
            exit(1)
    else:
        print("FAILURE: Failed to detect anomaly.")
        exit(1)
    print("--- TEST COMPLETE ---")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        run_test_environment()
    else:
        engine = LearningEngine(TRACE_DIR, LEARNING_MANIFEST_DIR)
        while True:
            engine.process_traces()
            time.sleep(10)
