#!/usr/bin/env python3
"""Run the NPOS test suite."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest

if __name__ == "__main__":
    loader = unittest.TestLoader()
    tests = loader.discover(os.path.dirname(os.path.abspath(__file__)), pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(tests)
    sys.exit(0 if result.wasSuccessful() else 1)