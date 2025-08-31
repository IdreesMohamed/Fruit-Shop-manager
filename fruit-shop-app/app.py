from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_file
from datetime import datetime, timedelta
from database import db, Transaction, init_db
from utils import validate_transaction_data, get_analytics_data, generate_chart, generate_payment_chart, export_to_csv, export_to_pdf
import io

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fruit_shop.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    data = request.form.to_dict()
    
    # Validate data
    errors = validate_transaction_data(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400
    
    # Create new transaction
    transaction = Transaction(
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        type=data['type'],
        amount=float(data['amount']),
        description=data.get('description', ''),
        fruit_name=data.get('fruit_name', ''),
        quantity=float(data['quantity']) if data.get('quantity') else None,
        price_per_unit=float(data['price_per_unit']) if data.get('price_per_unit') else None,
        payment_method=data.get('payment_method', 'cash')
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Transaction added successfully'})

@app.route('/get_transactions')
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).all()
    return jsonify([t.to_dict() for t in transactions])

@app.route('/update_transaction/<int:id>', methods=['POST'])
def update_transaction(id):
    transaction = Transaction.query.get_or_404(id)
    data = request.form.to_dict()
    
    # Validate data
    errors = validate_transaction_data(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400
    
    # Update transaction
    transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    transaction.type = data['type']
    transaction.amount = float(data['amount'])
    transaction.description = data.get('description', '')
    transaction.fruit_name = data.get('fruit_name', '')
    transaction.quantity = float(data['quantity']) if data.get('quantity') else None
    transaction.price_per_unit = float(data['price_per_unit']) if data.get('price_per_unit') else None
    transaction.payment_method = data.get('payment_method', 'cash')
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Transaction updated successfully'})

@app.route('/delete_transaction/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get_or_404(id)
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Transaction deleted successfully'})

@app.route('/delete_all_transactions', methods=['DELETE'])
def delete_all_transactions():
    Transaction.query.delete()
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'All transactions deleted successfully'})

@app.route('/analytics')
def analytics():
    # Get date range from query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    data = get_analytics_data(start_date, end_date)
    
    # Generate charts
    line_chart = generate_chart(data, 'line')
    bar_chart = generate_chart(data, 'bar')
    payment_chart = generate_payment_chart(data)
    
    return jsonify({
        'data': data,
        'line_chart': line_chart,
        'bar_chart': bar_chart,
        'payment_chart': payment_chart
    })

@app.route('/export_csv')
def export_csv():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query
    
    if start_date:
        query = query.filter(Transaction.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Transaction.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    transactions = query.order_by(Transaction.date.desc()).all()
    csv_data = export_to_csv(transactions)
    
    output = io.BytesIO()
    output.write(csv_data.encode('utf-8'))
    output.seek(0)
    
    return send_file(
        output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'transactions_{datetime.now().strftime("%Y%m%d")}.csv'
    )

@app.route('/export_pdf')
def export_pdf():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query
    
    if start_date:
        query = query.filter(Transaction.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Transaction.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    transactions = query.order_by(Transaction.date.desc()).all()
    data = get_analytics_data(start_date, end_date)
    
    pdf_data = export_to_pdf(data, transactions)
    
    output = io.BytesIO()
    output.write(pdf_data)
    output.seek(0)
    
    return send_file(
        output,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'report_{datetime.now().strftime("%Y%m%d")}.pdf'
    )

if __name__ == '__main__':
    app.run(debug=True)