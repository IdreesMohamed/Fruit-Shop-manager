// Global variables
let currentEditId = null;
let pendingDeleteId = null;
let pendingDeleteAll = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Load initial data
    loadTransactions();
    loadAnalytics();
    
    // Set up event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Transaction form submission
    document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction);
    
    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', handleEditTransaction);
    
    // Date filter for analytics
    document.getElementById('startDate').addEventListener('change', loadAnalytics);
    document.getElementById('endDate').addEventListener('change', loadAnalytics);
    
    // Confirm button in confirmation modal
    document.getElementById('confirmBtn').addEventListener('click', handleConfirmAction);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editModal');
        const confirmModal = document.getElementById('confirmModal');
        
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

// Handle add transaction
async function handleAddTransaction(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/add_transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Transaction added successfully!', 'success');
            event.target.reset();
            document.getElementById('date').valueAsDate = new Date();
            loadTransactions();
            loadAnalytics();
        } else {
            showToast('Error: ' + result.errors.join(', '), 'error');
        }
    } catch (error) {
        showToast('Error adding transaction', 'error');
        console.error('Error:', error);
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch('/get_transactions');
        const transactions = await response.json();
        
        displayTransactions(transactions);
        updateStats(transactions);
    } catch (error) {
        showToast('Error loading transactions', 'error');
        console.error('Error:', error);
    }
}

// Display transactions in table
function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No transactions found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>
                <span class="badge ${transaction.type}">
                    ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
            </td>
            <td class="amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
            </td>
            <td>${transaction.description || '-'}</td>
            <td>
                <span class="badge ${transaction.payment_method}">
                    ${transaction.payment_method === 'cash' ? 'Cash' : 'Digital'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning" onclick="editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats(transactions) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = income - expenses;
    
    document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${expenses.toFixed(2)}`;
    document.getElementById('totalProfit').textContent = `₹${profit.toFixed(2)}`;
    
    // Update profit color based on value
    const profitElement = document.getElementById('totalProfit');
    if (profit >= 0) {
        profitElement.style.color = '#50C878';
    } else {
        profitElement.style.color = '#E74C3C';
    }
}

// Load analytics
async function loadAnalytics() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    try {
        let url = '/analytics';
        const params = new URLSearchParams();
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        displayAnalytics(data);
    } catch (error) {
        showToast('Error loading analytics', 'error');
        console.error('Error:', error);
    }
}

// Display analytics data
function displayAnalytics(data) {
    // Update summary statistics
    document.getElementById('avgDailyIncome').textContent = `₹${data.data.avg_daily_income.toFixed(2)}`;
    document.getElementById('avgDailyExpenses').textContent = `₹${data.data.avg_daily_expense.toFixed(2)}`;
    document.getElementById('avgDailyProfit').textContent = `₹${data.data.avg_daily_profit.toFixed(2)}`;
    document.getElementById('totalDays').textContent = data.data.total_days;
    
    // Update charts
    document.getElementById('lineChart').src = 'data:image/png;base64,' + data.line_chart;
    document.getElementById('barChart').src = 'data:image/png;base64,' + data.bar_chart;
    document.getElementById('paymentChart').src = 'data:image/png;base64,' + data.payment_chart;
}

// Edit transaction
async function editTransaction(id) {
    try {
        const response = await fetch('/get_transactions');
        const transactions = await response.json();
        const transaction = transactions.find(t => t.id === id);
        
        if (transaction) {
            currentEditId = id;
            
            // Populate edit form
            document.getElementById('editId').value = transaction.id;
            document.getElementById('editDate').value = transaction.date;
            document.getElementById('editType').value = transaction.type;
            document.getElementById('editAmount').value = transaction.amount;
            document.getElementById('editDescription').value = transaction.description || '';
            document.getElementById('editPaymentMethod').value = transaction.payment_method;
            document.getElementById('editFruitName').value = transaction.fruit_name || '';
            document.getElementById('editQuantity').value = transaction.quantity || '';
            document.getElementById('editPricePerUnit').value = transaction.price_per_unit || '';
            
            // Show edit modal
            document.getElementById('editModal').style.display = 'block';
        }
    } catch (error) {
        showToast('Error loading transaction for editing', 'error');
        console.error('Error:', error);
    }
}

// Handle edit transaction
async function handleEditTransaction(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`/update_transaction/${currentEditId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Transaction updated successfully!', 'success');
            closeEditModal();
            loadTransactions();
            loadAnalytics();
        } else {
            showToast('Error: ' + result.errors.join(', '), 'error');
        }
    } catch (error) {
        showToast('Error updating transaction', 'error');
        console.error('Error:', error);
    }
}

// Delete transaction
function deleteTransaction(id) {
    pendingDeleteId = id;
    pendingDeleteAll = false;
    
    document.getElementById('confirmMessage').textContent = 'Are you sure you want to delete this transaction?';
    document.getElementById('confirmModal').style.display = 'block';
}

// Delete all transactions
function deleteAllTransactions() {
    pendingDeleteId = null;
    pendingDeleteAll = true;
    
    document.getElementById('confirmMessage').textContent = 'Are you sure you want to delete all transactions? This action cannot be undone.';
    document.getElementById('confirmModal').style.display = 'block';
}

// Handle confirm action
async function handleConfirmAction() {
    try {
        if (pendingDeleteAll) {
            const response = await fetch('/delete_all_transactions', {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('All transactions deleted successfully!', 'success');
                loadTransactions();
                loadAnalytics();
            }
        } else if (pendingDeleteId) {
            const response = await fetch(`/delete_transaction/${pendingDeleteId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Transaction deleted successfully!', 'success');
                loadTransactions();
                loadAnalytics();
            }
        }
        
        closeConfirmModal();
    } catch (error) {
        showToast('Error deleting transaction(s)', 'error');
        console.error('Error:', error);
    }
}

// Export to CSV
function exportCSV() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let url = '/export_csv';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    window.open(url, '_blank');
}

// Export to PDF
function exportPDF() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let url = '/export_pdf';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    window.open(url, '_blank');
}

// Clear date filter
function clearDateFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadAnalytics();
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
}

// Close confirm modal
function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    pendingDeleteId = null;
    pendingDeleteAll = false;
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Add CSS for badges
const style = document.createElement('style');
style.textContent = `
    .badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .badge.income {
        background: rgba(80, 200, 120, 0.1);
        color: #50C878;
    }
    
    .badge.expense {
        background: rgba(231, 76, 60, 0.1);
        color: #E74C3C;
    }
    
    .badge.cash {
        background: rgba(127, 140, 141, 0.1);
        color: #7F8C8D;
    }
    
    .badge.digital {
        background: rgba(74, 144, 226, 0.1);
        color: #4A90E2;
    }
`;
document.head.appendChild(style);