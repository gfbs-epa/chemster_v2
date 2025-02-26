"""Configure a Flask app and run locally if used as main."""

from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from config import db, ma
from auth import init_auth
from constants import CHEMSTER_UI_URL, API_ENDPOINT, SQLITE_DB_PATH
from resources.collections_resource import CollectionsResource, COLLECTIONS_ENDPOINT
from resources.chemicals_resource import ChemicalsResource, CHEMICALS_ENDPOINT
from util import abs_path # pylint: disable=import-error


def create_app(sqlalchemy_database_uri):
    """Configure a Flask app and attach SQLAlchemy, Marshmallow, CORS, and JWT instances."""

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
    rest_api.add_resource(CollectionsResource, COLLECTIONS_ENDPOINT, f'{COLLECTIONS_ENDPOINT}/<int:id>')
    rest_api.add_resource(ChemicalsResource, CHEMICALS_ENDPOINT)

    return app


if __name__ == '__main__':
    uri = f'sqlite:///{abs_path(SQLITE_DB_PATH)}'
    app_created = create_app(uri)
    app_created.run(debug=True)
