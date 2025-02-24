import os

from dotenv import load_dotenv

BASEDIR = os.path.abspath(os.path.dirname(__file__))

load_dotenv()
SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
CHEMSTER_UI_URL = os.getenv('CHEMSTER_UI_URL')

API_ENDPOINT = '/api'
REST_API_ENDPOINT = f'{API_ENDPOINT}/rest'
VIZ_API_ENDPOINT = f'{API_ENDPOINT}/viz'