"""Define REST API endpoint for chemical data."""

from flask import request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from constants import REST_API_ENDPOINT
from models import Collection
from schemas import CollectionSchema # pylint: disable=import-error
from util import query_param_bool # pylint: disable=import-error

COLLECTIONS_ENDPOINT = f'{REST_API_ENDPOINT}/collections'
collection_schema = CollectionSchema()
collections_schema = CollectionSchema(many=True)


class CollectionsResource(Resource):
    """Route REST API calls to operate on collection data."""

    @jwt_required()
    def get(self, id=None):
        """Route GET requests on collections endpoint."""

        base_query = db.select(Collection).filter_by(owner_id=int(get_jwt_identity()))
        if super_id := request.args.get('super_id'):
            # Check for recursive specification
            recursive = request.args.get('recursive', default=False, type=query_param_bool)
            response = self._list_by_super_id(base_query, super_id, recursive)
        else:
            abort(400, 'Missing request parameters')

        return collections_schema.dump(response)


    def _list_by_super_id(self, base_query, super_id, recursive):
        """Get a list of collections from a supercollection ID, optionally recursive."""

        # Compose either direct query or recursive query using CTE
        if recursive:
            cte = db.select(Collection).filter_by(super_id=super_id).cte(name='cte', recursive=True)
            union = cte.union_all(db.select(Collection).filter_by(super_id=cte.c.id))
            query = base_query.join(union, union.c.id == Collection.id).distinct()
        else:
            query = base_query.filter_by(super_id=super_id)

        # Return list of objects
        return db.session.execute(query).scalars()


    @jwt_required()
    def post(self):
        """Create a new collection from POST request on collections endpoint."""

        # Load new object from POST body
        collection = collection_schema.load(request.get_json())
        # Assign ownership to current user based on JWT
        collection.owner_id = int(get_jwt_identity())

        try:
            # Insert the new collection
            db.session.add(collection)
            db.session.commit()
        except IntegrityError:
            # Check for duplicate insertion
            abort(409, message=f'Error creating collection {collection.name}: collection already exists')

        return collection, 201


    @jwt_required()
    def delete(self, id):
        """Delete a collection from DELETE request on collections endpoint."""
        
        collection = db.one_or_404(db.select(Collection).filter_by(owner_id=int(get_jwt_identity()), id=id))
        db.session.delete(collection)
        db.session.commit()

        return '', 204
