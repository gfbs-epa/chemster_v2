import pandas as pd

from aiohttp_retry import ExponentialRetry, RetryClient
from asyncio import gather
from flask import abort, Blueprint, jsonify, make_response, request
from flask_jwt_extended import jwt_required

from util import CTX_API_KEY, CTX_API_REQUEST_LIMIT, CTX_API_URL, VIZ_API_ENDPOINT

CTX_API_PROPERTY_URL = f'{CTX_API_URL}/property/search/by-dtxsid/'

# Create a Flask blueprint to register all visualization API routes under the same prefix
viz = Blueprint('viz', __name__, url_prefix=VIZ_API_ENDPOINT)

@viz.route('/properties', methods=['POST'])
@jwt_required()
async def properties():
    """Retrieve a table of requested property values from a given prediction source for a list of DTXSIDs."""

    # Get the chemicals of interest
    dtxsids = request.get_json()
    if not dtxsids or not len(dtxsids):
        abort(400, 'Must provide DTXSIDs in POST body')

    # Get requested property IDs
    property_ids = request.args.getlist('property_id')
    if not property_ids:
        abort(400, 'Must provide property IDs in query params')

    # Get requested property source
    property_source = request.args.get('property_source')
    if not property_source:
        abort(400, 'Must provide a source ID in query params')

    # Break DTXSIDs into chunks according to limit and run async requests
    limit = int(CTX_API_REQUEST_LIMIT)
    dtxsid_chunks = [dtxsids[i:i + limit] for i in range(0, len(dtxsids), limit)]

    # Note: have to reinitialize client on every request
    # asyncio doesn't work in the general Flask context due to dependence on event loop
    # Makes this slower than it needs to be, but not enough of a concern to completely rearchitect around it
    # Timing varies but consistently under 30 s for ~4,000 compounds, which is satisfactory
    retry_options = ExponentialRetry(attempts=3)
    headers = {'x-api-key': CTX_API_KEY, 'accept': 'application/json'}
    results = []
    async with RetryClient(retry_options=retry_options) as client:
        responses = await gather(*[client.post(CTX_API_PROPERTY_URL, json=chunk, headers=headers) for chunk in dtxsid_chunks])
        for res in responses:
            results.extend(await res.json())

    return jsonify(_process_results(results, property_source, property_ids))


def _process_results(results_json, property_source, property_ids):
    """Helper function to trim and filter results from CTX API queries and convert to dict in split format."""

    processed_results = [{'dtxsid': r['dtxsid'], 'propertyId': r['propertyId'], 'value': r['value']} 
                            for r in results_json
                                if r['propType'] == 'predicted'
                                and r['source'] == property_source
                                and r['propertyId'] in property_ids]

    return pd.DataFrame(processed_results).pivot(index='dtxsid', columns='propertyId', values='value').to_dict(orient='split') if processed_results else {}