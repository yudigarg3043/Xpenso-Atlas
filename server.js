const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');

// Import middleware
const authenticateToken = require('./middleware/auth');

// Import User model from models/User.js
const User = require('./models/User');

// Import expense model from models/expense.js
const Expense = require('./models/Expense');

// Import expense model from models/income.js
const Income = require('./models/Income');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.engine('hbs', exphbs.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Register User
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = new User({
            fullName,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user data and token
        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add expense (with JWT protection)
app.post('/api/expense', authenticateToken, async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;

        const newExpense = new Expense({
            userId: req.user.id, // comes from token
            description,
            amount,
            category,
            date
        });

        await newExpense.save();

        res.status(201).json({ message: 'Expense added successfully' });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Add income (with JWT protection)
app.post('/api/income', authenticateToken, async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;

        const newIncome = new Income({
            userId: req.user.id, // comes from token
            description,
            amount,
            category,
            date
        });

        await newIncome.save();

        res.status(201).json({ message: 'Income added successfully' });
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// // Serve static HTML pages
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// app.get('/dashboard', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
// });

// app.get('/contact', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'contact.html'));
// });

app.get('/', (req, res) => {
    res.render('index');  // uses views/index.hbs
  });
  
  app.get('/dashboard', (req, res) => {
    res.render('dashboard');  // uses views/dashboard.hbs
  });
  
  app.get('/contact', (req, res) => {
    res.render('contact');  // uses views/contact.hbs
  });

  app.get('/expense', (req, res) => {
    res.render('expense');  // uses views/expense.hbs
  });

  app.get('/income', (req,res) => {
    res.render('income');
  })


  app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const expenses = await Expense.find({ userId: userId });

        res.json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/expenses/recent', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const expenses = await Expense.find({ userId: userId });

        res.json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

  

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
