# Quick Start Guide - Fruit & Juice Shop Management App

## 🚀 Getting Started in Under 5 Minutes

### Option 1: Using Setup Scripts (Recommended)

**For macOS/Linux:**
```bash
cd fruit-shop-app
./setup.sh
source venv/bin/activate
python run.py
```

**For Windows:**
```cmd
cd fruit-shop-app
setup.bat
venv\Scripts\activate.bat
python run.py
```

### Option 2: Manual Setup

1. **Navigate to the app directory**
   ```bash
   cd fruit-shop-app
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate environment**
   ```bash
   # macOS/Linux
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate.bat
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the app**
   ```bash
   python run.py
   ```

6. **Open browser**
   Go to `http://localhost:5000`

## 📱 First-Time Use

### Step 1: Add Your First Transaction
1. **Date**: Already set to today
2. **Type**: Choose "Income" or "Expense"
3. **Amount**: Enter the amount in ₹
4. **Description**: Add a brief description
5. **Payment Method**: Select "Cash" or "Digital"
6. **Click "Add Transaction"**

### Step 2: Explore the Dashboard
- **Quick Stats**: See total income, expenses, and profit
- **Analytics**: View charts and averages
- **Transactions**: Manage your entries

### Step 3: Try Advanced Features
- **Edit Transactions**: Click the pencil icon
- **Filter Analytics**: Use date range filters
- **Export Reports**: Download CSV or PDF files

## 🎯 Key Features at a Glance

| Feature | Description | Location |
|---------|-------------|----------|
| **Add Transaction** | Record income/expenses | Top of page |
| **Quick Stats** | View totals at a glance | Middle section |
| **Analytics** | Charts and insights | Dashboard section |
| **Export** | Download reports | Export section |
| **Manage** | Edit/delete entries | Transactions table |

## 💡 Pro Tips

### For Better Record-Keeping
1. **Use Descriptions**: Always add meaningful descriptions
2. **Track Payment Methods**: Separate cash and digital payments
3. **Add Fruit Details**: Use optional fields for inventory tracking
4. **Regular Backups**: Export reports regularly

### For Analytics
1. **Date Filtering**: Use date ranges to analyze specific periods
2. **Compare Periods**: Check weekly/monthly performance
3. **Payment Analysis**: Monitor cash vs digital payment trends

### For Mobile Users
1. **Responsive Design**: Works perfectly on phones
2. **Touch-Friendly**: Large buttons and forms
3. **Quick Actions**: Easy edit/delete on the go

## 🔧 Troubleshooting

### Common Issues & Solutions

**Port Already in Use**
```bash
# Change port in run.py or app.py
app.run(debug=True, port=5001)
```

**Database Issues**
```bash
# Delete and recreate database
rm fruit_shop.db
python run.py
```

**Permission Issues**
```bash
# Make setup script executable (macOS/Linux)
chmod +x setup.sh
```

**Charts Not Showing**
- Check internet connection (for fonts/icons)
- Clear browser cache
- Try a different browser

## 📞 Need Help?

- **Read the README**: `README.md` has detailed documentation
- **Check Console**: Browser DevTools for JavaScript errors
- **Review Logs**: Terminal output for server errors

## 🎉 You're Ready!

Your Fruit & Juice Shop Management App is now ready to use. Start adding transactions and watch your business analytics come to life!

**Happy Managing! 🍎🥝🍌**