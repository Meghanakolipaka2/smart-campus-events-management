from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User, Event, Registration, Bookmark
from sqlalchemy import func
from datetime import date

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    today = date.today().isoformat()
    data = {}

    if user.role == 'admin':
        data['total_users'] = User.query.count()
        data['total_events'] = Event.query.count()
        data['total_registrations'] = Registration.query.count()
        data['pending_events'] = Event.query.filter_by(status='pending').count()
        data['active_students'] = db.session.query(func.count(func.distinct(Registration.user_id))).scalar()
        data['total_organizers'] = User.query.filter_by(role='organizer').count()
        data['events_this_month'] = Event.query.filter(Event.date >= today[:7] + '-01').count()
    elif user.role == 'organizer':
        my_events = Event.query.filter_by(organizer_id=user_id)
        data['my_events'] = my_events.count()
        data['my_registrations'] = sum(e.registrations.count() for e in my_events.all())
        data['upcoming_events'] = my_events.filter(Event.date >= today).count()
        data['avg_popularity'] = int(
            db.session.query(func.avg(Event.popularity_score)).filter_by(organizer_id=user_id).scalar() or 0
        )
    else:
        data['registered_events'] = Registration.query.filter_by(user_id=user_id).count()
        data['bookmarked'] = Bookmark.query.filter_by(user_id=user_id).count()
        data['upcoming_events'] = Event.query.filter(Event.status == 'approved', Event.date >= today).count()
        data['leaderboard_rank'] = f'#{user.points or 0} pts'

    leaders = db.session.query(User, func.count(Registration.id).label('cnt'))\
        .join(Registration, Registration.user_id == User.id)\
        .filter(User.role == 'student').group_by(User.id)\
        .order_by(func.count(Registration.id).desc()).limit(10).all()
    data['leaderboard'] = [{'id': u.id,'name': u.name,'events_attended': c,'points': u.points} for u,c in leaders]

    monthly = db.session.query(func.substr(Event.date,1,7).label('month'), func.count(Registration.id).label('count'))\
        .join(Registration, Registration.event_id == Event.id)\
        .group_by(func.substr(Event.date,1,7)).order_by(func.substr(Event.date,1,7)).limit(6).all()
    data['monthly_registrations'] = [{'month': m,'count': c} for m,c in monthly]

    cat_data = db.session.query(Event.category, func.count(Event.id)).filter_by(status='approved').group_by(Event.category).all()
    data['category_breakdown'] = [{'name': cat.capitalize(),'count': cnt} for cat,cnt in cat_data]

    return jsonify(data), 200

@analytics_bp.route('/events', methods=['GET'])
@jwt_required()
def get_event_stats():
    top = Event.query.filter_by(status='approved').order_by(Event.popularity_score.desc()).limit(5).all()
    return jsonify({'top_events': [{'title': e.title, 'popularity': e.popularity_score, 'registrations': e.registrations.count()} for e in top]}), 200
