from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
import json

admin_bp = Blueprint('admin', __name__)

def require_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return None, jsonify({'message': 'Admin access required'}), 403
    return user, None, None

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id = int(get_jwt_identity())
    caller = User.query.get(user_id)
    if caller.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@admin_bp.route('/users/<int:uid>', methods=['PUT'])
@jwt_required()
def update_user(uid):
    user_id = int(get_jwt_identity())
    caller = User.query.get(user_id)
    if caller.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    user = User.query.get_or_404(uid)
    data = request.get_json()
    if 'role' in data and data['role'] in ['student', 'organizer', 'admin']:
        user.role = data['role']
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200

@admin_bp.route('/users/<int:uid>', methods=['DELETE'])
@jwt_required()
def delete_user(uid):
    user_id = int(get_jwt_identity())
    caller = User.query.get(user_id)
    if caller.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    user = User.query.get_or_404(uid)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200
