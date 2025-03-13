"""Configure a Flask app and run locally if used as main."""

from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from config import db, ma, jwt
from util import CHEMSTER_UI_URL, API_ENDPOINT, SQLITE_DB_PATH, JWT_SECRET_KEY, abs_path
from resources.collections import CollectionsResource, COLLECTIONS_ENDPOINT
from resources.chemical_collections import ChemicalCollectionsResource, CHEMICAL_COLLECTIONS_ENDPOINT
from routes.auth import auth
from routes.viz import viz


def create_app(sqlalchemy_database_uri):
    """Configure a Flask app and attach SQLAlchemy, Marshmallow, CORS, and JWT instances."""

    # Start Flask app
    app = Flask(__name__)

    # Start SQLAlchemy database connection
    app.config['SQLALCHEMY_DATABASE_URI'] = sqlalchemy_database_uri
    db.init_app(app)

    # Start Marshmallow serializer/deserializer
    ma.init_app(app)

    # Start JWT manager for authentication
    app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) # Access tokens last 1 hour by default
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7) # Refresh tokens last 7 days by default
    jwt.init_app(app)

    # Register RESTful(-ish) API resources and routes
    rest_api = Api(app)
    rest_api.add_resource(CollectionsResource, COLLECTIONS_ENDPOINT, f'{COLLECTIONS_ENDPOINT}/<int:id>')
    rest_api.add_resource(ChemicalCollectionsResource, CHEMICAL_COLLECTIONS_ENDPOINT)

    # Register non-REST API routes for authentication
    app.register_blueprint(auth)
    # Register non-REST API routes for visualizations
    app.register_blueprint(viz)

    # Set up CORS with front-end only access policy to all API endpoints
    CORS(app, resources={f'{API_ENDPOINT}/*': {'origins': CHEMSTER_UI_URL}})

    return app


if __name__ == '__main__':
    uri = f'sqlite:///{abs_path(SQLITE_DB_PATH)}'
    app_created = create_app(uri)
    app_created.run(debug=True)
