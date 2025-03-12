"""Create SQLAlchemy, Marshmallow, and JWT instances to attach to Flask app."""

from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# These must be defined outside the api.py file to avoid circular imports
# since they are also used elsewhere in app files
db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
