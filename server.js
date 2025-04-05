const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Income Schema
const incomeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Income = mongoose.model('Income', incomeSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw new Error();
        }
        
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Routes

// Register User
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login User
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Profile
app.get('/api/users/me', auth, async (req, res) => {
    try {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Income Routes

// Get all incomes for a user
app.get('/api/income', auth, async (req, res) => {
    try {
        const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
        res.json({ incomes });
    } catch (error) {
        console.error('Get incomes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new income
app.post('/api/income', auth, async (req, res) => {
    try {
        const { title, amount, date, category, notes } = req.body;
        
        const income = new Income({
            user: req.user._id,
            title,
            amount,
            date,
            category,
            notes
        });
        
        await income.save();
        res.status(201).json({ income });
    } catch (error) {
        console.error('Add income error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update income
app.put('/api/income/:id', auth, async (req, res) => {
    try {
        const { title, amount, date, category, notes } = req.body;
        
        // Find income and check if it belongs to the user
        const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!income) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        // Update income
        income.title = title;
        income.amount = amount;
        income.date = date;
        income.category = category;
        income.notes = notes;
        
        await income.save();
        res.json({ income });
    } catch (error) {
        console.error('Update income error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete income
app.delete('/api/income/:id', auth, async (req, res) => {
    try {
        // Find income and check if it belongs to the user
        const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!income) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        await income.remove();
        res.json({ message: 'Income deleted' });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Expense Routes

// Get all expenses for a user
app.get('/api/expense', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.json({ expenses });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new expense
app.post('/api/expense', auth, async (req, res) => {
    try {
        const { title, amount, date, category, notes } = req.body;
        
        const expense = new Expense({
            user: req.user._id,
            title,
            amount,
            date,
            category,
            notes
        });
        
        await expense.save();
        res.status(201).json({ expense });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update expense
app.put('/api/expense/:id', auth, async (req, res) => {
    try {
        const { title, amount, date, category, notes } = req.body;
        
        // Find expense and check if it belongs to the user
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        // Update expense
        expense.title = title;
        expense.amount = amount;
        expense.date = date;
        expense.category = category;
        expense.notes = notes;
        
        await expense.save();
        res.json({ expense });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete expense
app.delete('/api/expense/:id', auth, async (req, res) => {
    try {
        // Find expense and check if it belongs to the user
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        await expense.remove();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Dashboard Route
app.get('/api/dashboard', auth, async (req, res) => {
    try {
        // Get all incomes and expenses for the user
        const incomes = await Income.find({ user: req.user._id });
        const expenses = await Expense.find({ user: req.user._id });
        
        // Get recent transactions (combined incomes and expenses)
        const recentIncomes = incomes.map(income => ({
            ...income.toObject(),
            type: 'income'
        }));
        
        const recentExpenses = expenses.map(expense => ({
            ...expense.toObject(),
            type: 'expense'
        }));
        
        const recentTransactions = [...recentIncomes, ...recentExpenses]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        res.json({
            income: incomes,
            expenses: expenses,
            recentTransactions: recentTransactions
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve static assets in production
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));