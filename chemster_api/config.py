"""Create SQLAlchemy and Marshmallow instances to attach to Flask app."""

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# These must be defined outside the api.py file to avoid circular imports
# since they are also used elsewhere in app files
db = SQLAlchemy()
ma = Marshmallow()

# Could create separate init_db(app) and init_ma(app) functions here
# as for JWT authentication, but right now there's no more complex
# configuration needed to justify that
