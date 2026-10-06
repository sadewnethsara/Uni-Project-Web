"""
Shared Environment & Path Loader for all automation scripts.
Finds and loads the project root .env file and sets up Python sys.path.
"""

import os
import sys

def load_project_env():
    """Locate the project root .env file and load variables into os.environ."""
    curr = os.path.abspath(__file__)
    for _ in range(4):
        curr = os.path.dirname(curr)
        env_file = os.path.join(curr, ".env")
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'").strip('"')
                        if k not in os.environ:
                            os.environ[k] = v
            # Add scripts/ directory to sys.path so 'scraper' and other modules can be imported
            scripts_dir = os.path.join(curr, "scripts")
            if scripts_dir not in sys.path:
                sys.path.insert(0, scripts_dir)
            return True
    return False

# Automatically execute on import
load_project_env()
