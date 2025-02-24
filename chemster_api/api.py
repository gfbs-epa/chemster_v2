import logging

from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from config import db, ma
from auth import init_auth
from constants import CHEMSTER_UI_URL, API_ENDPOINT, SQLITE_DB_PATH
from resources.collections_resource import CollectionsResource, COLLECTIONS_ENDPOINT
from resources.chemicals_resource import ChemicalsResource, CHEMICALS_ENDPOINT
from util import abs_path

# Your garden-variety Flask app initializer
def create_app(sqlalchemy_database_uri):
    # Set up logging to file
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
        datefmt='%m-%d %H:%M',
        handlers=[logging.FileHandler(abs_path('chemster_api.log')), logging.StreamHandler()],
    )

    # Start Flask app
    app = Flask(__name__)

    # Start SQLAlchemy database connection
    app.config['SQLALCHEMY_DATABASE_URI'] = sqlalchemy_database_uri
    db.init_app(app)

    # Start Marshmallow serializer/deserializer
    ma.init_app(app)

    # Start CORS with front-end only access policy to all API endpoints
    CORS(app, resources={f'{API_ENDPOINT}/*': {'origins': CHEMSTER_UI_URL}})

    # Start JWT manager and register non-REST API authentication routes
    init_auth(app)

    # Start REST API and register endpoints
    rest_api = Api(app)
    rest_api.add_resource(CollectionsResource, COLLECTIONS_ENDPOINT)
    rest_api.add_resource(ChemicalsResource, CHEMICALS_ENDPOINT)

    return app

if __name__ == '__main__':
    sqlalchemy_database_uri = f'sqlite:///{abs_path(SQLITE_DB_PATH)}'
    app = create_app(sqlalchemy_database_uri)
    app.run(debug=True)