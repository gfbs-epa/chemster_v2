import logging

from flask import request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from constants import REST_API_ENDPOINT
from models import Collection
from schemas import CollectionSchema
from util import query_param_bool

logger = logging.getLogger(__name__)

COLLECTIONS_ENDPOINT = f'{REST_API_ENDPOINT}/collections'
collection_schema = CollectionSchema()
collections_schema = CollectionSchema(many=True)

class CollectionsResource(Resource):
    # Route GET requests
    @jwt_required()
    def get(self):
        super_id = request.args.get('super_id')
        recursive = request.args.get('recursive', default=False, type=query_param_bool)
        current_user_id = int(get_jwt_identity())
        return self._get_collections(current_user_id, super_id, recursive), 200

    # Get collections (without query params, lists all collections in database)
    ## Optional query param name = get a single collection by name (guaranteed unique at database level)
    ## Optional query param super_id = list only collections from a single supercollection
    ## Optional query param recursive = list all collections recursively from a single supercollection
    def _get_collections(self, current_user_id, super_id, recursive):
        # Start with a global select statement to get collections filtered by current user
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
                logger.info(f'Retrieving collections recursively from supercollection ID {super_id} and subcollections')
                cte = db.select(Collection).filter_by(super_id=super_id).cte(name='cte', recursive=True)
                union = cte.union_all(db.select(Collection).filter_by(super_id=cte.c.id))
                stmt = stmt.join(union, union.c.id == Collection.id).distinct()
            else:
                logger.info(f'Retrieving collections from supercollection ID {super_id}')
                stmt = stmt.filter_by(super_id=super_id)
        else:
            logger.info(f'Retrieving all collections')

        # Execute composed query
        collections = db.session.execute(stmt).scalars()
        collections_json = collections_schema.dump(collections)
        logger.info('Collections retrieved')
        return collections_json
    
    # Insert a new collection from POST request
    @jwt_required()
    def post(self):
        collection = collection_schema.load(request.get_json())
        # Assign ownership to current user based on JWT
        collection.owner_id = int(get_jwt_identity())
        try:
            # Insert the new collection
            db.session.add(collection)
            db.session.commit()
        except IntegrityError as ie:
            # Check for duplicate insertion
            logger.warning(f'SQLAlchemy Integrity Error: {ie}')
            abort(409, message=f'Error creating collection {collection.name}: collection already exists')
        else:
            return collection, 201