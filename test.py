#!/usr/bin/env python
import sys
print("Test script started", file=sys.stdout, flush=True)
print("Python version:", sys.version, file=sys.stdout, flush=True)

try:
    import flask
    print("Flask imported successfully", file=sys.stdout, flush=True)
except Exception as e:
    print(f"Flask import error: {e}", file=sys.stderr, flush=True)

try:
    import pandas
    print("Pandas imported successfully", file=sys.stdout, flush=True)
except Exception as e:
    print(f"Pandas import error: {e}", file=sys.stderr, flush=True)

try:
    from server import app
    print("Server imported successfully", file=sys.stdout, flush=True)
except Exception as e:
    print(f"Server import error: {e}", file=sys.stderr, flush=True)
    import traceback
    traceback.print_exc()

print("Test complete", file=sys.stdout, flush=True)
