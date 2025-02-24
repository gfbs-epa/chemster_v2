import logging

from datetime import timedelta, timezone, datetime
from flask import request, abort, jsonify
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, 
    create_access_token, 
    create_refresh_token, 
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from sqlalchemy.exc import IntegrityError

from config import db
from constants import JWT_SECRET_KEY, API_ENDPOINT
from models import User, RevokedJWT

logger = logging.getLogger(__name__)

# This is just a configuration/initialization file like config.py, but
# with more complex instructions since authentication endpoints are registered here
# instead of run through the REST API

# Configure and initialize JWT authentication and associated routes
def init_auth(app):
    # Changing secret key in .env will immediately invalidate all extant tokens
    app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
    # Access tokens last 1 hour by default
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    # Refresh tokens last 7 days by default
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    jwt = JWTManager(app)

    # Callback to check for revoked token on all calls
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        # If matching record found in revoked_jwts table, identify token revoked and deny access
        revoked = db.session.execute(db.select(RevokedJWT.id).filter_by(jti=jwt_payload['jti'])).scalar_one_or_none() is not None
        return revoked

    # POST endpoint to register a new user and provide JWTs
    @app.route(f'{API_ENDPOINT}/register', methods=['POST'])
    def register():
        # Get credentials from POST body
        login = request.get_json()
        username = login['username']

        try:
            # Insert the new user with hashed password
            db.session.add(User(username=username, password_hash=generate_password_hash(login['password']).decode('utf-8')))
            db.session.commit()
        except IntegrityError as ie:
            # Check for duplicate insertion
            logger.warning(f'SQLAlchemy Integrity Error: {ie}')
            abort(409, message=f'Error creating user {username}: user already exists')

        # Check user created successfully
        user = db.session.execute(db.select(User).filter_by(username=username)).scalar_one_or_none()
        if not user:
            logger.error(f'Unknown database error - failed to insert user: {username}')
            abort(500, f'Error creating user {username}: unknown error')

        # Create the access and refresh tokens and return them to the client
        identity = str(user.id)
        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)
        return jsonify(access_token=access_token, refresh_token=refresh_token), 201

    # POST endpoint to log in an existing user and provide JWTs
    @app.route(f'{API_ENDPOINT}/login', methods=['POST'])
    def login():
        # Get credentials from POST body
        login = request.get_json()
        username = login['username']

        # Check if user exists and user password matches saved password hash
        existing_user = db.session.execute(db.select(User).filter_by(username=username)).scalar_one_or_none()
        if existing_user and check_password_hash(existing_user.password_hash, login['password']):
            logger.info(f'Login successful: {username}')
            # Create the access and refresh tokens and return them to the client
            identity = str(existing_user.id)
            access_token = create_access_token(identity=identity)
            refresh_token = create_refresh_token(identity=identity)
            return jsonify(access_token=access_token, refresh_token=refresh_token)
        else:
            logger.warning(f'Login failed: {username}')
            abort(401, 'Login failed')

    # GET endpoint (also accepts POST, body ignored) to refresh a user's access token
    # using their associated refresh token
    @app.route(f'{API_ENDPOINT}/refresh', methods=['GET', 'POST'])
    @jwt_required(refresh=True)
    def refresh():
        access_token = create_access_token(identity=get_jwt_identity())
        return jsonify(access_token=access_token)
    
    # GET endpoint (also accepts POST, body ignored) to log out user and revoke JWT
    # Front-end must call this twice to revoke both access and refresh tokens
    @app.route(f'{API_ENDPOINT}/logout', methods=['GET', 'POST'])
    @jwt_required(verify_type=False)
    def logout():
        db.session.add(RevokedJWT(jti=get_jwt()['jti'], revoked_at=datetime.now(timezone.utc)))
        db.session.commit()
        return jsonify(message=f'Logged out')
