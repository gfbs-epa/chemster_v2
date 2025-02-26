"""Initialize authentication for Flask app using JWT."""

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


def init_auth(app):
    """Configure JWT, attach to Flask app, and register callbacks and routes."""

    # Changing secret key in .env will immediately invalidate all extant tokens
    app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
    # Access tokens last 1 hour by default
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    # Refresh tokens last 7 days by default
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    jwt = JWTManager(app)


    # jwt_header is needed in method signature, but not used
    # pylint: disable=unused-argument
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        """Check for revoked token on all calls to protected endpoints."""

        # If matching record found in revoked_jwts table, identify token revoked and deny access
        return db.session.execute(db.select(RevokedJWT.id).filter_by(jti=jwt_payload['jti'])).scalar_one_or_none() is not None


    @app.route(f'{API_ENDPOINT}/register', methods=['POST'])
    def register():
        """Register a new user from credentials in POST body and provide JWTs if successful."""

        # Load credentials from POST body
        username, password = _load_credentials(request)

        try:
            # Insert the new user with hashed password
            db.session.add(User(username=username, password_hash=generate_password_hash(password).decode('utf-8')))
            db.session.commit()
        except IntegrityError:
            # Check for duplicate insertion
            abort(409, message=f'Error creating user {username}: user already exists')

        # Check user created successfully
        user = db.session.execute(db.select(User).filter_by(username=username)).scalar_one_or_none()
        if not user:
            abort(500, f'Error creating user {username}: unknown error')

        # Create the access and refresh tokens and return them to the client
        return _make_token_response(user), 201


    @app.route(f'{API_ENDPOINT}/login', methods=['POST'])
    def login():
        """Login an existing user from credentials in POST body and provide JWTs if successful."""

        # Load credentials from POST body
        username, password = _load_credentials(request)

        # Check if user exists and user password matches saved password hash
        existing_user = db.session.execute(db.select(User).filter_by(username=username)).scalar_one_or_none()
        if existing_user and check_password_hash(existing_user.password_hash, password):
            # Create the access and refresh tokens and return them to the client
            return _make_token_response(existing_user)

        abort(401, 'Login failed')


    def _load_credentials(request):
        credentials = request.get_json()
        return credentials['username'], credentials['password']


    def _make_token_response(user):
        identity = str(user.id)
        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)
        return jsonify(access_token=access_token, refresh_token=refresh_token)


    @app.route(f'{API_ENDPOINT}/refresh', methods=['GET', 'POST'])
    @jwt_required(refresh=True)
    def refresh():
        """Refresh an access token using an associated refresh token."""

        access_token = create_access_token(identity=get_jwt_identity())
        return jsonify(access_token=access_token)


    @app.route(f'{API_ENDPOINT}/logout', methods=['GET', 'POST'])
    @jwt_required(verify_type=False)
    def logout():
        """Revoke a provided JWT - must be called individually on both access and refresh tokens."""

        db.session.add(RevokedJWT(jti=get_jwt()['jti'], revoked_at=datetime.now(timezone.utc)))
        db.session.commit()
        return jsonify(message='Logged out')
