"""Sanity check - write to file from root."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.apps.enhanced_calculators import calculate_delay_times
r = calculate_delay_times(172)
q = [d for d in r if d.note_value == '1/4'][0]

with open("sanity_output.txt", "w") as f:
    f.write(f"Quarter at 172 BPM: {q.ms:.2f}ms\n")
    f.write(f"Eighth at 172 BPM: {[d for d in r if d.note_value == '1/8'][0].ms:.2f}ms\n")
    f.write(f"Total items: {len(r)}\n")

print("Sanity check wrote to sanity_output.txt")