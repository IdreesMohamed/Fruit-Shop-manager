from datetime import datetime, timedelta
from database import db, Transaction
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import io
import base64
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import csv
from io import StringIO

def validate_transaction_data(data):
    errors = []
    
    if not data.get('date'):
        errors.append('Date is required')
    if not data.get('type') or data['type'] not in ['income', 'expense']:
        errors.append('Valid type (income/expense) is required')
    if not data.get('amount') or float(data['amount']) <= 0:
        errors.append('Amount must be greater than 0')
    if data.get('quantity') and float(data.get('quantity', 0)) <= 0:
        errors.append('Quantity must be greater than 0')
    if data.get('price_per_unit') and float(data.get('price_per_unit', 0)) <= 0:
        errors.append('Price per unit must be greater than 0')
    
    return errors

def get_analytics_data(start_date=None, end_date=None):
    query = Transaction.query
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.all()
    
    income_total = sum(t.amount for t in transactions if t.type == 'income')
    expense_total = sum(t.amount for t in transactions if t.type == 'expense')
    profit_total = income_total - expense_total
    
    cash_income = sum(t.amount for t in transactions if t.type == 'income' and t.payment_method == 'cash')
    digital_income = sum(t.amount for t in transactions if t.type == 'income' and t.payment_method == 'digital')
    
    daily_data = {}
    for t in transactions:
        date_str = t.date.strftime('%Y-%m-%d')
        if date_str not in daily_data:
            daily_data[date_str] = {'income': 0, 'expense': 0, 'profit': 0}
        
        if t.type == 'income':
            daily_data[date_str]['income'] += t.amount
        else:
            daily_data[date_str]['expense'] += t.amount
        
        daily_data[date_str]['profit'] = daily_data[date_str]['income'] - daily_data[date_str]['expense']
    
    avg_daily_income = income_total / len(daily_data) if daily_data else 0
    avg_daily_expense = expense_total / len(daily_data) if daily_data else 0
    avg_daily_profit = profit_total / len(daily_data) if daily_data else 0
    
    return {
        'income_total': income_total,
        'expense_total': expense_total,
        'profit_total': profit_total,
        'cash_income': cash_income,
        'digital_income': digital_income,
        'daily_data': daily_data,
        'avg_daily_income': avg_daily_income,
        'avg_daily_expense': avg_daily_expense,
        'avg_daily_profit': avg_daily_profit,
        'total_days': len(daily_data)
    }

import matplotlib.pyplot as plt
import io, base64

def generate_payment_chart(data):
    labels = list(data.keys())
    raw_sizes = list(data.values())

    # Ensure sizes are only numbers (if dict, take first value or 0)
    sizes = []
    for val in raw_sizes:
        if isinstance(val, dict):
            # try to extract numeric value from dict
            num = next((v for v in val.values() if isinstance(v, (int, float))), 0)
            sizes.append(num)
        elif isinstance(val, (int, float)):
            sizes.append(val)
        else:
            sizes.append(0)

    if not sizes or sum(sizes) == 0:
        labels = ["No Data"]
        sizes = [1]

    colors = ['#FF9999', '#66B2FF', '#99FF99', '#FFD966']
    plt.figure(figsize=(6, 6))
    plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
    plt.axis('equal')

    import io, base64
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    chart_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close()
    return chart_base64



def generate_chart(data):
    labels = list(data.keys())
    values = list(data.values())

    if not values or sum(values) == 0:
        labels = ["No Data"]
        values = [0]

    plt.figure(figsize=(8, 5))
    plt.bar(labels, values, color="#66B2FF")
    plt.xlabel("Category")
    plt.ylabel("Value")
    plt.title("Revenue Chart")

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    chart_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close()
    return chart_base64


def export_to_csv(transactions):
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['Date', 'Type', 'Amount', 'Description', 'Fruit Name', 'Quantity', 
                     'Price per Unit', 'Payment Method', 'Created At'])
    
    for t in transactions:
        writer.writerow([
            t.date.strftime('%Y-%m-%d'),
            t.type,
            t.amount,
            t.description or '',
            t.fruit_name or '',
            t.quantity or '',
            t.price_per_unit or '',
            t.payment_method,
            t.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return output.getvalue()

def export_to_pdf(data, transactions):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title = Paragraph("Fruit & Juice Shop Financial Report", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 20))
    
    # Summary
    summary_data = [
        ['Metric', 'Amount (₹)'],
        ['Total Income', f"{data['income_total']:.2f}"],
        ['Total Expenses', f"{data['expense_total']:.2f}"],
        ['Total Profit', f"{data['profit_total']:.2f}"],
        ['Cash Income', f"{data['cash_income']:.2f}"],
        ['Digital Income', f"{data['digital_income']:.2f}"],
        ['Average Daily Income', f"{data['avg_daily_income']:.2f}"],
        ['Average Daily Expenses', f"{data['avg_daily_expense']:.2f}"],
        ['Average Daily Profit', f"{data['avg_daily_profit']:.2f}"]
    ]
    
    summary_table = Table(summary_data)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 20))
    
    # Transactions
    story.append(Paragraph("Transactions", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    transaction_data = [['Date', 'Type', 'Amount', 'Description', 'Payment Method']]
    for t in transactions:
        transaction_data.append([
            t.date.strftime('%Y-%m-%d'),
            t.type,
            f"{t.amount:.2f}",
            t.description or '',
            t.payment_method
        ])
    
    transaction_table = Table(transaction_data)
    transaction_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(transaction_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()