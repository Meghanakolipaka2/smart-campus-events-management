import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db, jwt

load_dotenv()


def create_app():
    app = Flask(__name__)

    # ================= CONFIG =================
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

    # ================= DATABASE =================
    DATABASE_URL = os.getenv("DATABASE_URL")

    if DATABASE_URL:
        app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///test.db"

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # ================= INIT =================
    db.init_app(app)
    jwt.init_app(app)

    # ✅ FIXED CORS (VERY IMPORTANT)
    CORS(
        app,
        resources={r"/*": {"origins": [
            "https://smart-campus-events-management.vercel.app"
        ]}},
        supports_credentials=True
    )

    # ✅ EXTRA SAFETY (handles all browsers)
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response

    # ================= ROUTES =================
    from routes.auth import auth_bp
    from routes.events import events_bp
    from routes.admin import admin_bp
    from routes.notifications import notifications_bp
    from routes.analytics import analytics_bp
    from routes.venues import venues_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(venues_bp, url_prefix='/api/venues')

    # ================= CREATE TABLES =================
    with app.app_context():
        from models.user import User, Event, Registration, Bookmark, Notification, Venue

        db.create_all()

        try:
            seed_data()
        except Exception as e:
            print("Seed error:", e)

    return app


# ================= SEED DATA =================
def seed_data():
    from models.user import User
    import bcrypt

    demos = [
        {'name': 'Demo Student', 'email': 'student@demo.com', 'role': 'student'},
        {'name': 'Demo Organizer', 'email': 'organizer@demo.com', 'role': 'organizer'},
        {'name': 'Admin User', 'email': 'admin@demo.com', 'role': 'admin'},
    ]

    for d in demos:
        existing_user = db.session.query(User).filter_by(email=d['email']).first()

        if not existing_user:
            pw_hash = bcrypt.hashpw('demo123'.encode(), bcrypt.gensalt()).decode()

            user = User(
                name=d['name'],
                email=d['email'],
                password_hash=pw_hash,
                role=d['role']
            )

            db.session.add(user)

    db.session.commit()


# ================= RUN =================
if __name__ == '__main__':
    app = create_app()

    port = int(os.environ.get("PORT", 5000))  # ✅ REQUIRED FOR RENDER
    app.run(host="0.0.0.0", port=port)