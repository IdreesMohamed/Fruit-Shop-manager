from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    fruit_name = db.Column(db.String(100))
    quantity = db.Column(db.Float)
    price_per_unit = db.Column(db.Float)
    payment_method = db.Column(db.String(20), default='cash')  # 'cash' or 'digital'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'type': self.type,
            'amount': self.amount,
            'description': self.description,
            'fruit_name': self.fruit_name,
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit,
            'payment_method': self.payment_method,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()