from config import ma
from models import (
    User,
    Chemical, 
    Collection, 
    Property, 
    CollectionChemical, 
    ChemicalProperty
)

# Marshmallow schemas for data model
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

class PropertySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Property
        include_fk = True

class CollectionChemicalSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CollectionChemical
        include_fk = True

class ChemicalPropertySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ChemicalProperty
        include_fk = True

# Revoked JWTs never need to be dumped or loaded,
# so no schema needed for the RevokedJWT model