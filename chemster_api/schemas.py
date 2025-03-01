"""Define Marshmallow schemas for SQLAlchemy entities associated with this database."""

from marshmallow_sqlalchemy import auto_field
from config import ma
from models import (
    User,
    Chemical,
    Collection,
    CollectionChemical
)


# We don't need docstrings for all of these
# pylint: disable=missing-class-docstring
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        


class ChemicalSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Chemical


class CollectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Collection
        include_fk = True
        load_instance = True

    # This field is required by the database, but set internally,
    # so needs to be ignored when deserializing the user input
    owner_id = auto_field(required=False)


class CollectionChemicalSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CollectionChemical
        include_fk = True


# Revoked JWTs never need to be serialized/deserialized,
# so no schema needed for the RevokedJWT model
