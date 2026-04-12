from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User, Event, Registration, Bookmark, Notification
from datetime import date
import json

events_bp = Blueprint('events', __name__)

def notify_user(user_id, title, message, notif_type='info'):
    n = Notification(user_id=user_id, title=title, message=message, type=notif_type)
    db.session.add(n)


@events_bp.route('', methods=['GET'])
@jwt_required()
def get_events():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    q = Event.query
    # Filters
    category = request.args.get('category')
    status_filter = request.args.get('status', 'upcoming')
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'date')
    my_events = request.args.get('my_events')
    ev_status = request.args.get('status_approval', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 9))

    # Only approved events for non-admins by default
    if user.role != 'admin':
        if my_events and user.role == 'organizer':
            q = q.filter(Event.organizer_id == user_id)
        elif ev_status:
            q = q.filter(Event.status == ev_status)
        else:
            q = q.filter(Event.status == 'approved')
    elif ev_status:
        q = q.filter(Event.status == ev_status)

    if category: q = q.filter(Event.category == category)
    if search: q = q.filter(Event.title.ilike(f'%{search}%'))

    today = date.today().isoformat()
    if status_filter == 'upcoming': q = q.filter(Event.date >= today)
    elif status_filter == 'past': q = q.filter(Event.date < today)

    if sort == 'popularity': q = q.order_by(Event.popularity_score.desc())
    elif sort == 'title': q = q.order_by(Event.title)
    else: q = q.order_by(Event.date)

    total = q.count()
    events = q.offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        'events': [e.to_dict(user_id) for e in events],
        'total': total, 'page': page, 'limit': limit
    }), 200


@events_bp.route('/recommended', methods=['GET'])
@jwt_required()
def get_recommended():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    interests = user.get_interests()

    # Get registered event IDs
    registered_ids = [r.event_id for r in Registration.query.filter_by(user_id=user_id).all()]

    today = date.today().isoformat()
    q = Event.query.filter(Event.status == 'approved', Event.date >= today,
                           ~Event.id.in_(registered_ids) if registered_ids else True)

    # Score events by interest match + popularity
    events = q.all()
    scored = []
    for ev in events:
        score = ev.popularity_score or 0
        ev_tags = ev.get_tags()
        if ev.category in interests: score += 50
        for tag in ev_tags:
            if tag in interests: score += 20
        scored.append((score, ev))

    scored.sort(key=lambda x: x[0], reverse=True)
    recommended = [ev for _, ev in scored[:6]]

    return jsonify({'events': [e.to_dict(user_id) for e in recommended]}), 200


@events_bp.route('/bookmarks', methods=['GET'])
@jwt_required()
def get_bookmarks():
    user_id = int(get_jwt_identity())
    bms = Bookmark.query.filter_by(user_id=user_id).all()
    result = []
    for bm in bms:
        result.append({'event_id': bm.event_id, 'event': bm.event.to_dict(user_id) if bm.event else None})
    return jsonify({'bookmarks': result}), 200


@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get_or_404(event_id)
    is_registered = Registration.query.filter_by(user_id=user_id, event_id=event_id).first() is not None
    is_bookmarked = Bookmark.query.filter_by(user_id=user_id, event_id=event_id).first() is not None
    return jsonify({
        'event': event.to_dict(user_id),
        'is_registered': is_registered,
        'is_bookmarked': is_bookmarked
    }), 200


@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ['organizer', 'admin']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    required = ['title', 'description', 'category', 'date', 'time', 'venue', 'max_participants']
    if not all(data.get(f) for f in required):
        return jsonify({'message': 'Missing required fields'}), 400

    event = Event(
        title=data['title'], description=data['description'],
        category=data['category'], date=data['date'], time=data['time'],
        venue=data['venue'], max_participants=int(data['max_participants']),
        organizer_id=user_id, tags=json.dumps(data.get('tags', [])),
        status='approved' if user.role == 'admin' else 'pending'
    )
    db.session.add(event)
    db.session.flush()

    # Notify admin
    admins = User.query.filter_by(role='admin').all()
    for admin in admins:
        notify_user(admin.id, 'New Event Submitted',
                    f'"{event.title}" by {user.name} is pending approval.', 'event')

    db.session.commit()
    return jsonify({'event': event.to_dict(user_id), 'message': 'Event submitted for approval'}), 201


@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    event = Event.query.get_or_404(event_id)

    if user.role == 'admin':
        pass  # admin can edit any
    elif user.role == 'organizer' and event.organizer_id == user_id:
        pass
    else:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    fields = ['title', 'description', 'category', 'date', 'time', 'venue', 'max_participants', 'status']
    for f in fields:
        if f in data:
            if f == 'max_participants': setattr(event, f, int(data[f]))
            elif f == 'tags': event.tags = json.dumps(data[f])
            else: setattr(event, f, data[f])

    if 'tags' in data: event.tags = json.dumps(data['tags'])

    # Notify registered students on approval
    if data.get('status') == 'approved':
        regs = Registration.query.filter_by(event_id=event_id).all()
        students = User.query.filter_by(role='student').all()
        for s in students:
            notify_user(s.id, 'New Event Available!',
                        f'"{event.title}" has been approved and is now open for registration.', 'event')

    db.session.commit()
    return jsonify({'event': event.to_dict(user_id)}), 200


@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    event = Event.query.get_or_404(event_id)

    if user.role != 'admin' and event.organizer_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    Registration.query.filter_by(event_id=event_id).delete()
    Bookmark.query.filter_by(event_id=event_id).delete()
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted'}), 200


@events_bp.route('/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_event(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get_or_404(event_id)

    if event.status != 'approved':
        return jsonify({'message': 'Event not available'}), 400
    if Registration.query.filter_by(user_id=user_id, event_id=event_id).first():
        return jsonify({'message': 'Already registered'}), 409
    if event.registrations.count() >= event.max_participants:
        return jsonify({'message': 'Event is full'}), 400

    reg = Registration(user_id=user_id, event_id=event_id)
    db.session.add(reg)

    # Increase popularity
    event.popularity_score = min(100, (event.popularity_score or 0) + 2)

    # Update user points
    user = User.query.get(user_id)
    user.points = (user.points or 0) + 10

    # Notify user
    notify_user(user_id, 'Registration Confirmed! 🎉',
                f'You are registered for "{event.title}" on {event.date} at {event.time}.', 'success')

    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 201


@events_bp.route('/<int:event_id>/register', methods=['DELETE'])
@jwt_required()
def unregister_event(event_id):
    user_id = int(get_jwt_identity())
    reg = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if not reg:
        return jsonify({'message': 'Not registered'}), 404

    event = Event.query.get(event_id)
    if event:
        event.popularity_score = max(0, (event.popularity_score or 0) - 1)

    user = User.query.get(user_id)
    if user: user.points = max(0, (user.points or 0) - 10)

    db.session.delete(reg)
    db.session.commit()
    return jsonify({'message': 'Unregistered successfully'}), 200


@events_bp.route('/<int:event_id>/bookmark', methods=['POST'])
@jwt_required()
def toggle_bookmark(event_id):
    user_id = int(get_jwt_identity())
    bm = Bookmark.query.filter_by(user_id=user_id, event_id=event_id).first()
    if bm:
        db.session.delete(bm)
        db.session.commit()
        return jsonify({'message': 'Removed from bookmarks', 'bookmarked': False}), 200
    else:
        bm = Bookmark(user_id=user_id, event_id=event_id)
        db.session.add(bm)
        db.session.commit()
        return jsonify({'message': 'Bookmarked', 'bookmarked': True}), 201
