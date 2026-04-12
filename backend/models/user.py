from app import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'organizer', 'admin'), default='student')
    interests = db.Column(db.Text, default='[]')  # JSON array
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_interests(self):
        try: return json.loads(self.interests or '[]')
        except: return []

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email,
            'role': self.role, 'interests': self.get_interests(),
            'points': self.points, 'created_at': str(self.created_at)
        }


class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum('technical', 'cultural', 'sports', 'workshop', 'nss', 'fest'), nullable=False)
    date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    time = db.Column(db.String(10), nullable=False)  # HH:MM
    venue = db.Column(db.String(200), nullable=False)
    max_participants = db.Column(db.Integer, default=50)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum('pending', 'approved', 'rejected'), default='pending')
    tags = db.Column(db.Text, default='[]')  # JSON array
    popularity_score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organizer = db.relationship('User', foreign_keys=[organizer_id])
    registrations = db.relationship('Registration', backref='event', lazy='dynamic')

    def get_tags(self):
        try: return json.loads(self.tags or '[]')
        except: return []

    def to_dict(self, user_id=None):
        reg_count = self.registrations.count()
        return {
            'id': self.id, 'title': self.title, 'description': self.description,
            'category': self.category, 'date': self.date, 'time': self.time,
            'venue': self.venue, 'max_participants': self.max_participants,
            'organizer_id': self.organizer_id,
            'organizer_name': self.organizer.name if self.organizer else 'Unknown',
            'status': self.status, 'tags': self.get_tags(),
            'popularity_score': self.popularity_score,
            'registrations_count': reg_count,
            'created_at': str(self.created_at)
        }


class Registration(db.Model):
    __tablename__ = 'registrations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    attended = db.Column(db.Boolean, default=False)

    user = db.relationship('User', foreign_keys=[user_id])
    __table_args__ = (db.UniqueConstraint('user_id', 'event_id'),)


class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    event = db.relationship('Event')
    __table_args__ = (db.UniqueConstraint('user_id', 'event_id'),)


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text)
    type = db.Column(db.String(20), default='info')  # info, success, warning, event
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'message': self.message,
            'type': self.type, 'is_read': self.is_read,
            'created_at': str(self.created_at)
        }


class Venue(db.Model):
    __tablename__ = 'venues'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    capacity = db.Column(db.Integer)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name,
            'capacity': self.capacity, 'location': self.location
        }
