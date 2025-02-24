import os

from constants import BASEDIR

# Locate files in directory (defaults to project base directory) by absolute path
def abs_path(filename, dir=BASEDIR):
    return os.path.join(dir, filename)

# Query parameter type check function to interpret boolean
def query_param_bool(p):
    return p.lower() in ['true', 't']