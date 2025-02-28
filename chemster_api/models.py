"""Define SQLAlchemy models for tables in this database."""

from config import db


# We don't need docstrings for all of these
# pylint: disable=missing-class-docstring
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(32, collation='NOCASE'),
                         nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False, unique=True)


class Chemical(db.Model):
    __tablename__ = 'chemicals'
    dtxsid = db.Column(db.String(16, collation='NOCASE'), primary_key=True)


class Collection(db.Model):
    __tablename__ = 'collections'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255, collation='NOCASE'),
                     nullable=False, index=True)
    super_id = db.Column(db.Integer, db.ForeignKey(
        'collections.id'), index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), nullable=False, index=True)
    # Create composite unique constraint
    __table_args__ = (db.UniqueConstraint(name, super_id, owner_id),)
    # Foreign key relationships
    super = db.relationship('Collection', remote_side=id)
    owner = db.relationship('User')


class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255, collation='NOCASE'),
                     nullable=False, unique=True, index=True)
    collection_id = db.Column(db.Integer, db.ForeignKey(
        'collections.id'), nullable=False, index=True)
    # Foreign key relationships
    collection = db.relationship('Collection')


class CollectionChemical(db.Model):
    __tablename__ = 'collection_chemicals'
    collection_id = db.Column(db.Integer, db.ForeignKey(
        'collections.id'), nullable=False, index=True)
    chemical_dtxsid = db.Column(db.String(16, collation='NOCASE'), db.ForeignKey(
        'chemicals.dtxsid'), nullable=False, index=True)
    # Create composite primary key
    __table_args__ = (db.PrimaryKeyConstraint(collection_id, chemical_dtxsid),)
    # Foreign key relationships
    collection = db.relationship('Collection')
    chemical = db.relationship('Chemical')


class ChemicalProperty(db.Model):
    __tablename__ = 'chemical_properties'
    chemical_dtxsid = db.Column(db.String(16, collation='NOCASE'), db.ForeignKey(
        'chemicals.dtxsid'), nullable=False, index=True)
    property_id = db.Column(db.Integer, db.ForeignKey(
        'properties.id'), nullable=False, index=True)
    value = db.Column(db.Double, nullable=False)
    # Create composite primary key
    __table_args__ = (db.PrimaryKeyConstraint(chemical_dtxsid, property_id),)
    # Foreign key relationships
    chemical = db.relationship('Chemical')
    property = db.relationship('Property')


# Not connected to data model - just retains revoked JWTs from user logouts
class RevokedJWT(db.Model):
    __tablename__ = 'revoked_jwts'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=False)
