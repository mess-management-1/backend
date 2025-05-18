require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// PostgreSQL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP temporarily (in-memory, use Redis in production)
const otpStore = new Map();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Create users table
async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE
    );
  `;
  try {
    await pool.query(query);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Failed to create users table:', error);
    throw error;
  }
}

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

  const otp = generateOTP();
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending OTP:', {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
    });
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const storedOtp = otpStore.get(email);
  if (!storedOtp || storedOtp.expires < Date.now()) {
    return res.status(400).json({ message: 'OTP expired or invalid' });
  }

  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  otpStore.delete(email);
  res.status(200).json({ message: 'OTP verified successfully' });
});

// Register user
app.post('/api/register', async (req, res) => {
  const { name, email, password, pincode } = req.body;
  if (!name || !email || !password || !pincode) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password, pincode, is_verified)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id, email
    `;
    const values = [name, email, hashedPassword, pincode];
    const result = await pool.query(query, values);

    const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = TRUE', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found or not verified' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Protected data', user: req.user });
});

// Initialize database and start server
initDb().then(() => {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});