from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User, Event, Venue

venues_bp = Blueprint('venues', __name__)

@venues_bp.route('', methods=['GET'])
@jwt_required()
def get_venues():
    venues = Venue.query.order_by(Venue.name).all()
    return jsonify({'venues': [v.to_dict() for v in venues]}), 200

@venues_bp.route('', methods=['POST'])
@jwt_required()
def create_venue():
    user_id = int(get_jwt_identity())
    if User.query.get(user_id).role != 'admin':
        return jsonify({'message': 'Admin only'}), 403
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'message': 'Venue name required'}), 400
    if Venue.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Venue already exists'}), 409
    v = Venue(name=data['name'], capacity=data.get('capacity'), location=data.get('location'))
    db.session.add(v)
    db.session.commit()
    return jsonify({'venue': v.to_dict()}), 201

@venues_bp.route('/<int:vid>', methods=['PUT'])
@jwt_required()
def update_venue(vid):
    user_id = int(get_jwt_identity())
    if User.query.get(user_id).role != 'admin':
        return jsonify({'message': 'Admin only'}), 403
    v = Venue.query.get_or_404(vid)
    data = request.get_json()
    for f in ['name','capacity','location']:
        if f in data: setattr(v, f, data[f])
    db.session.commit()
    return jsonify({'venue': v.to_dict()}), 200

@venues_bp.route('/<int:vid>', methods=['DELETE'])
@jwt_required()
def delete_venue(vid):
    user_id = int(get_jwt_identity())
    if User.query.get(user_id).role != 'admin':
        return jsonify({'message': 'Admin only'}), 403
    v = Venue.query.get_or_404(vid)
    db.session.delete(v)
    db.session.commit()
    return jsonify({'message': 'Venue deleted'}), 200

@venues_bp.route('/check-conflict', methods=['POST'])
@jwt_required()
def check_conflict():
    data = request.get_json()
    venue = data.get('venue')
    dt = data.get('date')
    time = data.get('time')
    exclude_id = data.get('exclude_id')
    q = Event.query.filter_by(venue=venue, date=dt, time=time, status='approved')
    if exclude_id:
        q = q.filter(Event.id != int(exclude_id))
    conflict = q.first()
    if conflict:
        return jsonify({'conflict': {'id': conflict.id, 'title': conflict.title}}), 200
    return jsonify({'conflict': None}), 200
