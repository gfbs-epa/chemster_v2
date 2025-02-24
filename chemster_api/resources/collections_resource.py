"""Define REST API endpoint for chemical data."""

import logging

from flask import request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from constants import REST_API_ENDPOINT
from models import Collection
from schemas import CollectionSchema # pylint: disable=import-error
from util import query_param_bool # pylint: disable=import-error

logger = logging.getLogger(__name__)

COLLECTIONS_ENDPOINT = f'{REST_API_ENDPOINT}/collections'
collection_schema = CollectionSchema()
collections_schema = CollectionSchema(many=True)


class CollectionsResource(Resource):
    """Route REST API calls to operate on collection data."""


    @jwt_required()
    def get(self):
        """Route GET requests on collections endpoint."""

        super_id = request.args.get('super_id')
        recursive = request.args.get('recursive', default=False, type=query_param_bool)
        current_user_id = int(get_jwt_identity())
        return self._get_collections(current_user_id, super_id, recursive), 200


    def _get_collections(self, current_user_id, super_id, recursive):
        """
        Get collections according to provided query parameters.
        
        Parameters:
            current_user_id (int): ID of current user retrieved from JWT.
            super_id (int): ID of supercollection to retrieve from, if provided.
            recursive (bool): Whether to retrieve collections recursively or not.

        Returns:
            str: JSON array of collections retrieved.
        """

        # Start with a global select statement to get only collections owned by current user
        stmt = db.select(Collection).filter_by(owner_id=current_user_id)
        if super_id:
            try:
                # Type check super_id query parameter
                int(super_id)
            except ValueError:
                # Explicitly throw 400 if non-integer
                # Default behavior if unchecked would be 500 from cast in query
                abort(400, 'Invalid supercollection ID')

            # Compose either direct query or recursive query using CTE
            if recursive:
                logger.info('Retrieving collections recursively from supercollection ID %s and subcollections', super_id)
                cte = db.select(Collection).filter_by(super_id=super_id).cte(name='cte', recursive=True)
                union = cte.union_all(db.select(Collection).filter_by(super_id=cte.c.id))
                stmt = stmt.join(union, union.c.id == Collection.id).distinct()
            else:
                logger.info('Retrieving collections from supercollection ID %s', super_id)
                stmt = stmt.filter_by(super_id=super_id)
        else:
            logger.info('Retrieving all collections')

        # Execute composed query
        collections = db.session.execute(stmt).scalars()
        collections_json = collections_schema.dump(collections)
        logger.info('Collections retrieved')
        return collections_json


    @jwt_required()
    def post(self):
        """Route POST requests on collections endpoint."""
        
        collection = collection_schema.load(request.get_json())
        # Assign ownership to current user based on JWT
        collection.owner_id = int(get_jwt_identity())
        try:
            # Insert the new collection
            db.session.add(collection)
            db.session.commit()
        except IntegrityError as ie:
            # Check for duplicate insertion
            logger.warning('SQLAlchemy Integrity Error: %s', ie)
            abort(409, message=f'Error creating collection {collection.name}: collection already exists')
        else:
            return collection, 201
