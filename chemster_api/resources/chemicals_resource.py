"""Define REST API endpoint for chemical data."""

from flask import request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from constants import REST_API_ENDPOINT
from models import Chemical, Collection, CollectionChemical
from schemas import ChemicalSchema # pylint: disable=import-error
from util import query_param_bool # pylint: disable=import-error

CHEMICALS_ENDPOINT = f'{REST_API_ENDPOINT}/chemicals'
chemical_schema = ChemicalSchema()
chemicals_schema = ChemicalSchema(many=True)


class ChemicalsResource(Resource):
    """Route REST API calls to operate on chemical data."""


    @jwt_required()
    def get(self):
        """Route GET requests on chemicals endpoint."""

        if collection_ids := request.args.getlist('collection_id'):
            base_query = db.select(Chemical).join(CollectionChemical).join(Collection).filter_by(owner_id=int(get_jwt_identity()))
            recursive = request.args.get('recursive', default=False, type=query_param_bool)
            chemicals = self._get_by_collection_ids(base_query, collection_ids, recursive)
            return chemicals_schema.dump(chemicals), 200
        else:
            abort(400, 'No collection IDs provided')


    def _get_by_collection_ids(self, base_query, collection_ids, recursive):
        # Compose either direct query or recursive query using CTE
        if recursive:
            cte = db.select(Collection).filter(Collection.id.in_(collection_ids)).cte(name='cte', recursive=True)
            union = cte.union_all(db.select(Collection).filter_by(super_id=cte.c.id))
            query = base_query.join(union, union.c.id == CollectionChemical.collection_id).distinct()
        else:
            query = base_query.filter(CollectionChemical.collection_id.in_(collection_ids)).distinct()

        return db.session.execute(query).scalars()
    

    @jwt_required()
    def post(self):
        """Create a new chemical from POST request on chemicals endpoint."""

        collection_id = request.args.get('collection_id')
        if request.args.get('batch', default=False, type=query_param_bool):
            response = self._insert_batch(chemicals_schema.load(request.get_json()), collection_id)
        else:
            response = self._insert_one(chemical_schema.load(request.get_json()), collection_id)

        return response, 201


    def _insert_one(self, chemical, collection_id):
        try:
            # Insert the new chemical
            db.session.add(chemical)
            db.session.commit()
            # Add it to the collection using the ID, if provided
            if collection_id:
                collection_chemical = CollectionChemical(chemical_dtxsid=chemical['dtxsid'], collection_id=collection_id)
                db.session.add(collection_chemical)
                db.session.commit()
        except IntegrityError:
            # Check for duplicate insertion
            abort(409, message=f'Error creating chemical {chemical['dtxsid']}: chemical already exists')

        return chemical_schema.dump(chemical)
    

    def _insert_batch(self, chemicals, collection_id):
        """Do batch inserts, ignoring conflicts."""

        for c in chemicals:
            # Check for an existing matching chemical
            existing_chemical = db.session.get(Chemical, c['dtxsid'])
            if not existing_chemical:
                # Otherwise add it and map it to the collection if provided
                db.session.add(Chemical(dtxsid=c['dtxsid']))
                if collection_id:
                    db.session.add(CollectionChemical(chemical_dtxsid=c['dtxsid'], collection_id=collection_id))
            elif collection_id:
                # If the chemical already exists, also check if it's already mapped, and add the mapping if not
                existing_collection_chemical = db.session.execute(db.select(CollectionChemical).filter_by(chemical_dtxsid=c['dtxsid'], collection_id=collection_id)).scalar_one_or_none()
                if not existing_collection_chemical:
                    db.session.add(CollectionChemical(chemical_dtxsid=c['dtxsid'], collection_id=collection_id))

        db.session.commit()
        return chemicals_schema.dump(chemicals)