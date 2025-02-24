import logging

from flask import request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from config import db
from constants import REST_API_ENDPOINT
from models import Chemical, Collection, CollectionChemical
from schemas import ChemicalSchema
from util import query_param_bool

logger = logging.getLogger(__name__)

CHEMICALS_ENDPOINT = f'{REST_API_ENDPOINT}/chemicals'
chemicals_schema = ChemicalSchema(many=True)

class ChemicalsResource(Resource):
    # Route GET requests
    @jwt_required()
    def get(self):
        collection_ids = request.args.getlist('collection_id')
        if not collection_ids:
            # Check collection ID provided - there should be no way to obtain the unfiltered chemical list
            abort(400, 'Collection ID(s) required')
        recursive = request.args.get('recursive', default=False, type=query_param_bool)
        current_user_id = int(get_jwt_identity())
        return self._get_chemicals_by_collection_ids(current_user_id, collection_ids, recursive), 200

    # List all chemicals belonging to one or more collections
    ## Optional query param recursive = list all chemicals recursively from all subcollections
    def _get_chemicals_by_collection_ids(self, current_user_id, collection_ids, recursive):
        for collection_id in collection_ids:
            try:
                # Type check ALL collection_id query parameters
                int(collection_id)
            except ValueError:
                # Explicitly throw 400 if non-integer
                # Default behavior if unchecked would be 500 from cast in query
                abort(400, f'{collection_id} is not a valid collection ID')

        # Concatenate requested collection IDs for logging
        collection_ids_str = ', '.join(collection_ids)
        # Start with a global select/join statement to get chemicals and collection information
        # and filter by ownership
        stmt = db.select(Chemical).join(CollectionChemical).join(Collection).filter_by(owner_id=current_user_id)
        # Compose either direct query or recursive query using CTE
        if recursive:
            logger.info(f'Retrieving chemicals recursively from collection ID {collection_ids_str} and subcollections')
            cte = db.select(Collection).filter(Collection.id.in_(collection_ids)).cte(name='cte', recursive=True)
            union = cte.union_all(db.select(Collection).filter_by(super_id=cte.c.id))
            stmt = stmt.join(union, union.c.id == CollectionChemical.collection_id).distinct()
        else:
            logger.info(f'Retrieving chemicals from collection ID {collection_ids_str}')
            stmt = stmt.filter(CollectionChemical.collection_id.in_(collection_ids)).distinct()

        # Execute composed query
        chemicals = db.session.execute(stmt).scalars()
        chemicals_json = chemicals_schema.dump(chemicals)
        logger.info(f'Chemicals retrieved')
        return chemicals_json