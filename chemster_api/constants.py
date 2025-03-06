"""Load environment variables and define constants in one place."""

import os

from dotenv import load_dotenv

BASEDIR = os.path.abspath(os.path.dirname(__file__))

load_dotenv()
SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
CHEMSTER_UI_URL = os.getenv('CHEMSTER_UI_URL')
CTX_API_URL = os.getenv('CTX_API_URL')
CTX_API_KEY = os.getenv('CTX_API_KEY')
CTX_API_REQUEST_LIMIT = os.getenv('CTX_API_REQUEST_LIMIT')

API_ENDPOINT = '/api'
REST_API_ENDPOINT = f'{API_ENDPOINT}/rest'
VIZ_API_ENDPOINT = f'{API_ENDPOINT}/viz'
