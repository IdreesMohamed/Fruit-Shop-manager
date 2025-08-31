"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Download, TrendingUp, TrendingDown, DollarSign, IndianRupee, BarChart3, PieChart } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts"
import jsPDF from "jspdf"

interface Transaction {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: number
  description?: string
  fruitName?: string
  quantity?: number
  pricePerUnit?: number
  paymentType: "CASH" | "DIGITAL"
  date: string
}

interface FormData {
  type: "INCOME" | "EXPENSE" | ""
  amount: string
  description: string
  fruitName: string
  quantity: string
  pricePerUnit: string
  paymentType: "CASH" | "DIGITAL" | ""
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [formData, setFormData] = useState<FormData>({
    type: "",
    amount: "",
    description: "",
    fruitName: "",
    quantity: "",
    pricePerUnit: "",
    paymentType: ""
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Calculate analytics
  const analytics = {
    totalIncome: transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0),
    totalProfit: transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0) - 
                 transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0),
    cashIncome: transactions.filter(t => t.type === "INCOME" && t.paymentType === "CASH").reduce((sum, t) => sum + t.amount, 0),
    digitalIncome: transactions.filter(t => t.type === "INCOME" && t.paymentType === "DIGITAL").reduce((sum, t) => sum + t.amount, 0)
  }

  // Chart data
  const incomeExpenseData = [
    { name: "Income", amount: analytics.totalIncome, color: "#50C878" },
    { name: "Expenses", amount: analytics.totalExpenses, color: "#E74C3C" }
  ]

  const paymentTypeData = [
    { name: "Cash", value: analytics.cashIncome, color: "#4A90E2" },
    { name: "Digital", value: analytics.digitalIncome, color: "#9B59B6" }
  ]

  // Daily trend data (last 7 days)
  const getLast7DaysData = () => {
    const days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString()
      
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toLocaleDateString() === dateStr
      )
      
      const income = dayTransactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)
      const expenses = dayTransactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        expenses,
        profit: income - expenses
      })
    }
    
    return days
  }

  const dailyTrendData = getLast7DaysData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.type || !formData.amount || !formData.paymentType) {
      setError("Please fill in all required fields")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be a positive number")
      return
    }

    const transaction: Transaction = {
      id: editingId || Date.now().toString(),
      type: formData.type,
      amount,
      description: formData.description || undefined,
      fruitName: formData.fruitName || undefined,
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : undefined,
      paymentType: formData.paymentType,
      date: new Date().toISOString()
    }

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? transaction : t))
      setSuccess("Transaction updated successfully")
      setEditingId(null)
    } else {
      setTransactions([...transactions, transaction])
      setSuccess("Transaction added successfully")
    }

    setFormData({
      type: "",
      amount: "",
      description: "",
      fruitName: "",
      quantity: "",
      pricePerUnit: "",
      paymentType: ""
    })
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      fruitName: transaction.fruitName || "",
      quantity: transaction.quantity?.toString() || "",
      pricePerUnit: transaction.pricePerUnit?.toString() || "",
      paymentType: transaction.paymentType
    })
    setEditingId(transaction.id)
  }

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id))
    setSuccess("Transaction deleted successfully")
  }

  const handleDeleteAll = () => {
    setTransactions([])
    setSuccess("All transactions deleted successfully")
  }

  const exportCSV = () => {
    const headers = ["Date", "Type", "Amount", "Description", "Fruit Name", "Quantity", "Price/Unit", "Payment Type"]
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.amount,
        t.description || "",
        t.fruitName || "",
        t.quantity || "",
        t.pricePerUnit || "",
        t.paymentType
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fruit-shop-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text("Fruit & Juice Shop Management Report", 20, 20)
    
    // Date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
    
    // Summary
    doc.setFontSize(16)
    doc.text("Financial Summary", 20, 45)
    doc.setFontSize(12)
    doc.text(`Total Income: ₹${analytics.totalIncome.toFixed(2)}`, 20, 55)
    doc.text(`Total Expenses: ₹${analytics.totalExpenses.toFixed(2)}`, 20, 65)
    doc.text(`Net Profit: ₹${analytics.totalProfit.toFixed(2)}`, 20, 75)
    doc.text(`Total Transactions: ${transactions.length}`, 20, 85)
    
    // Payment Breakdown
    doc.setFontSize(16)
    doc.text("Payment Breakdown", 20, 100)
    doc.setFontSize(12)
    doc.text(`Cash Income: ₹${analytics.cashIncome.toFixed(2)}`, 20, 110)
    doc.text(`Digital Income: ₹${analytics.digitalIncome.toFixed(2)}`, 20, 120)
    
    // Transactions
    doc.setFontSize(16)
    doc.text("Transactions", 20, 135)
    doc.setFontSize(10)
    
    let yPosition = 145
    transactions.forEach((transaction, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.text(`${index + 1}. ${new Date(transaction.date).toLocaleDateString()} - ${transaction.type}`, 20, yPosition)
      doc.text(`   Amount: ₹${transaction.amount.toFixed(2)}`, 20, yPosition + 5)
      doc.text(`   Payment: ${transaction.paymentType}`, 20, yPosition + 10)
      if (transaction.description || transaction.fruitName) {
        doc.text(`   Description: ${transaction.description || transaction.fruitName}`, 20, yPosition + 15)
        yPosition += 20
      } else {
        yPosition += 15
      }
    })
    
    doc.save(`fruit-shop-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C3E50]">Fruit & Juice Shop Management</h1>
          <p className="text-[#7F8C8D]">Track your daily income, expenses, and profits</p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#50C878]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#7F8C8D]">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#50C878]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C3E50]">₹{analytics.totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#E74C3C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#7F8C8D]">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-[#E74C3C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C3E50]">₹{analytics.totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4A90E2]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#7F8C8D]">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-[#4A90E2]" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.totalProfit >= 0 ? 'text-[#50C878]' : 'text-[#E74C3C]'}`}>
                ₹{analytics.totalProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4A90E2]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#7F8C8D]">Transactions</CardTitle>
              <IndianRupee className="h-4 w-4 text-[#4A90E2]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C3E50]">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="entry" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entry">Add Transaction</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="entry">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2C3E50]">
                  {editingId ? "Edit Transaction" : "Add New Transaction"}
                </CardTitle>
                <CardDescription className="text-[#7F8C8D]">
                  Enter your daily income or expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-[#2C3E50]">Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: "INCOME" | "EXPENSE") => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INCOME">Income</SelectItem>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-[#2C3E50]">Amount (₹) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="border-[#E1E8ED]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentType" className="text-[#2C3E50]">Payment Type *</Label>
                      <Select 
                        value={formData.paymentType} 
                        onValueChange={(value: "CASH" | "DIGITAL") => setFormData({...formData, paymentType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="DIGITAL">Digital (Paytm/UPI/PhonePe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fruitName" className="text-[#2C3E50]">Fruit Name (Optional)</Label>
                      <Input
                        id="fruitName"
                        placeholder="e.g., Apples, Oranges"
                        value={formData.fruitName}
                        onChange={(e) => setFormData({...formData, fruitName: e.target.value})}
                        className="border-[#E1E8ED]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-[#2C3E50]">Quantity (Optional)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 5 kg, 12 pieces"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        className="border-[#E1E8ED]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerUnit" className="text-[#2C3E50]">Price per Unit (Optional)</Label>
                      <Input
                        id="pricePerUnit"
                        type="number"
                        step="0.01"
                        placeholder="Price per kg/piece"
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                        className="border-[#E1E8ED]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#2C3E50]">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional notes..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="border-[#E1E8ED]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingId ? "Update Transaction" : "Add Transaction"}
                    </Button>
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingId(null)
                          setFormData({
                            type: "",
                            amount: "",
                            description: "",
                            fruitName: "",
                            quantity: "",
                            pricePerUnit: "",
                            paymentType: ""
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#2C3E50]">Transactions</CardTitle>
                  <CardDescription className="text-[#7F8C8D]">View and manage all transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportCSV} variant="outline" className="text-[#4A90E2] border-[#4A90E2]">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={exportPDF} variant="outline" className="text-[#4A90E2] border-[#4A90E2]">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-[#E74C3C] hover:bg-[#C0392B]">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all transactions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll} className="bg-[#E74C3C] hover:bg-[#C0392B]">
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-[#7F8C8D] py-8">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="text-[#7F8C8D]">
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === "INCOME" ? "default" : "secondary"}>
                                {transaction.type === "INCOME" ? (
                                  <span className="text-[#50C878]">Income</span>
                                ) : (
                                  <span className="text-[#E74C3C]">Expense</span>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-[#2C3E50]">
                              ₹{transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-[#7F8C8D]">
                              {transaction.description || transaction.fruitName || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.paymentType === "CASH" ? "Cash" : "Digital"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(transaction)}
                                  className="text-[#4A90E2] border-[#4A90E2]"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-[#E74C3C] border-[#E74C3C]">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this transaction?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(transaction.id)}
                                        className="bg-[#E74C3C] hover:bg-[#C0392B]"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#2C3E50] flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Income vs Expenses
                  </CardTitle>
                  <CardDescription className="text-[#7F8C8D]">Comparison of total income and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-64">
                    <BarChart data={incomeExpenseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E8ED" />
                      <XAxis dataKey="name" stroke="#7F8C8D" />
                      <YAxis stroke="#7F8C8D" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {incomeExpenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Payment Type Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#2C3E50] flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Payment Type Breakdown
                  </CardTitle>
                  <CardDescription className="text-[#7F8C8D]">Cash vs Digital payments distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-64">
                    <RechartsPieChart>
                      <Pie
                        data={paymentTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                      >
                        {paymentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Daily Trend Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-[#2C3E50] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Trend (Last 7 Days)
                  </CardTitle>
                  <CardDescription className="text-[#7F8C8D]">Income, expenses, and profit trends over the last week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-64">
                    <LineChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E8ED" />
                      <XAxis dataKey="date" stroke="#7F8C8D" />
                      <YAxis stroke="#7F8C8D" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="income" stroke="#50C878" strokeWidth={2} dot={{ fill: "#50C878" }} />
                      <Line type="monotone" dataKey="expenses" stroke="#E74C3C" strokeWidth={2} dot={{ fill: "#E74C3C" }} />
                      <Line type="monotone" dataKey="profit" stroke="#4A90E2" strokeWidth={2} dot={{ fill: "#4A90E2" }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#2C3E50]">Payment Type Breakdown</CardTitle>
                  <CardDescription className="text-[#7F8C8D]">Cash vs Digital payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7F8C8D]">Cash Income</span>
                      <span className="font-medium text-[#2C3E50]">₹{analytics.cashIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7F8C8D]">Digital Income</span>
                      <span className="font-medium text-[#2C3E50]">₹{analytics.digitalIncome.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-[#E1E8ED] rounded-full h-2">
                      <div 
                        className="bg-[#4A90E2] h-2 rounded-full" 
                        style={{ width: `${(analytics.cashIncome / (analytics.cashIncome + analytics.digitalIncome) || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#2C3E50]">Summary</CardTitle>
                  <CardDescription className="text-[#7F8C8D]">Financial overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7F8C8D]">Total Transactions</span>
                      <span className="font-medium text-[#2C3E50]">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7F8C8D]">Income Transactions</span>
                      <span className="font-medium text-[#50C878]">
                        {transactions.filter(t => t.type === "INCOME").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7F8C8D]">Expense Transactions</span>
                      <span className="font-medium text-[#E74C3C]">
                        {transactions.filter(t => t.type === "EXPENSE").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7F8C8D]">Average Transaction</span>
                      <span className="font-medium text-[#2C3E50]">
                        ₹{transactions.length > 0 ? (analytics.totalIncome / transactions.length).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}