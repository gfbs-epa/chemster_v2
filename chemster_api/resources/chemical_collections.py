"""Define REST API endpoint for chemical data selected through collections."""

from flask import jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from models import Chemical, Collection, CollectionChemical
from schemas import ChemicalSchema
from util import REST_API_ENDPOINT, query_param_bool

CHEMICAL_COLLECTIONS_ENDPOINT = f'{REST_API_ENDPOINT}/chemical-collections'
chemical_schema = ChemicalSchema()
chemicals_schema = ChemicalSchema(many=True)

class ChemicalCollectionsResource(Resource):
    """Route REST API calls to operate on chemical data selected through collections."""


    @jwt_required()
    def get(self):
        """Route GET requests on collection-chemicals endpoint, returning DTXSID + IDs of _all_ member collections."""

        if collection_ids := request.args.getlist('collection_id'):
            recursive = request.args.get('recursive', default=False, type=query_param_bool)
            chemical_collections = self._get_by_collection_ids(collection_ids, recursive)
            return jsonify([dict(row._mapping) for row in chemical_collections.all()])
        else:
            abort(400, 'No collection IDs provided')


    def _get_by_collection_ids(self, collection_ids, recursive):
        # Group query for chemical DTXSIDs + _all_ collection IDs (as delimited string)
        base_query = db.select(CollectionChemical.chemical_dtxsid, db.func.group_concat(CollectionChemical.collection_id, ',').label('collection_ids'))\
                        .join(Collection).filter_by(owner_id=int(get_jwt_identity())).group_by(CollectionChemical.chemical_dtxsid)
        # Compose either direct or recursive query and filter base accordingly
        if recursive:
            cte = db.select(Collection).filter(Collection.id.in_(collection_ids)).cte(name='cte', recursive=True)
            union = cte.union_all(db.select(Collection).filter_by(super_id=cte.c.id))
            query = base_query.join(union, union.c.id == CollectionChemical.collection_id)
        else:
            query = base_query.filter(CollectionChemical.collection_id.in_(collection_ids))

        return db.session.execute(query)
    

    # This whole POST construction is not really RESTful but it is so much more convenient to work with on the front-end
    @jwt_required()
    def post(self):
        """Add chemicals to a collection from a POST request with a list of DTXSIDs, creating new chemicals if needed."""

        # Check a collection ID was provided
        collection_id = request.args.get('collection_id')
        if not collection_id:
            abort(400, 'No collection ID provided')

        # Check the given collection exists
        db.get_or_404(Collection, collection_id)

        # Do batch insert
        response = self._insert_batch(request.get_json(), collection_id)

        return response, 201
    

    def _insert_batch(self, dtxsids, collection_id):
        """Do batch inserts, ignoring conflicts."""

        for dtxsid in dtxsids:
            # Check for an existing matching chemical
            existing_chemical = db.session.get(Chemical, dtxsid)
            # Parameters to search and create collection-chemical mapping
            params = { 'chemical_dtxsid': dtxsid, 'collection_id': collection_id }

            if not existing_chemical:
                # Otherwise add it and map it to the collection
                db.session.add(Chemical(dtxsid=dtxsid))
                db.session.add(CollectionChemical(**params))
            else:
                # If the chemical already exists, also check if it's already in the collection, and add it if not
                existing_collection_chemical = db.session.execute(db.select(CollectionChemical).filter_by(**params)).scalar_one_or_none()

                if not existing_collection_chemical:
                    db.session.add(CollectionChemical(**params))

        db.session.commit()
        return dtxsids