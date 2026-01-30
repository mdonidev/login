const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '5454', // Change this to your MySQL password
    database: 'login_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create database and table on startup
async function initializeDatabase() {
    let connection;
    try {
        // First connection: create database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '5454' // Change this to your MySQL password
        });

        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS login_app');
        console.log('Database created or already exists');
        await connection.end();

        // Second connection: create table in the database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '5454', // Change this to your MySQL password
            database: 'login_app'
        });

        // Create users table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.execute(createTableQuery);
        console.log('Users table created or already exists');

        // Ensure phone column exists (older installs may not have it)
        try {
            await connection.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL');
            console.log('Phone column added to users table');
        } catch (err) {
            // ER_DUP_FIELDNAME 1060 if column exists - ignore
            if (err && err.errno === 1060) {
                // column already exists
            } else {
                console.warn('Could not add phone column (might already exist):', err && err.code ? err.code : err);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Routes

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { name, email, password, confirmPassword, phone } = req.body;

    try {
        // Validate inputs
        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({ success: false, message: 'Please fill in all fields' });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Check if user already exists
            const [existingUser] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            // Insert user into database (include phone)
            const [result] = await connection.execute(
                'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, phone]
            );

            res.status(201).json({
                success: true,
                message: `Account created successfully! Welcome, ${name}!`,
                userId: result.insertId
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please fill in all fields' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Find user by email
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const user = users[0];

            // Compare password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            res.json({
                success: true,
                message: `Welcome back! Logged in as ${email}`,
                userId: user.id,
                name: user.name,
                phone: user.phone || null
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Get all users (for testing purposes - remove in production)
app.get('/api/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.execute('SELECT id, name, email, phone, created_at FROM users');
            res.json({ success: true, users });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Start server after database initialization
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});
