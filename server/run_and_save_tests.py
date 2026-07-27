#!/usr/bin/env python3
"""Run tests and save results to a text file."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
import io

from server.test_hub import *

if __name__ == "__main__":
    # Capture test output
    output = io.StringIO()
    runner = unittest.TextTestRunner(stream=output, verbosity=2)
    
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules['server.test_hub'])
    result = runner.run(suite)
    
    # Write to file
    result_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test_results.txt')
    with open(result_path, 'w', encoding='utf-8') as f:
        f.write(output.getvalue())
        f.write(f"\n\n{'='*60}\n")
        f.write(f"Tests run: {result.testsRun}\n")
        f.write(f"Failures: {len(result.failures)}\n")
        f.write(f"Errors: {len(result.errors)}\n")
        f.write(f"Was successful: {result.wasSuccessful()}\n")
    
    print(f"Results written to {result_path}")
    print(output.getvalue())
    sys.exit(0 if result.wasSuccessful() else 1)