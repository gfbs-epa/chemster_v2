"""Define global utility functions that don't depend on app context."""

import os

from constants import BASEDIR


def abs_path(filename, basedir=BASEDIR):
    """Locate files in directory (defaults to project base directory) by absolute path."""
    return os.path.join(basedir, filename)


def query_param_bool(p):
    """Interpret a string query parameter as a boolean."""
    return p.lower() in ['true', 't']
