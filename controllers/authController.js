const pool = require('../config/db');
const { db } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendMail');
const { users } = require('../db/schema');
const { eq, and } = require('drizzle-orm');
let mainCode;
const requestVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const code = crypto.randomBytes(3).toString('hex');
    mainCode=code;
    const existing = await db.select().from(users);
    if (existing.length > 0) {
      // await pool.query('UPDATE users SET verification_code = $1 WHERE email = $2', [code, email]);
      await db.update(users).set({verification_code:code}).where({email:email});
    } else {
      // await pool.query('INSERT INTO users (email, verification_code) VALUES ($1, $2)', [email, code]);
      await db.insert(users).values({eamil:email,verification_code:code});
    }

    await sendVerificationEmail(email, code);
    res.json({ message: 'Verification code sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  console.log(email,code);
  try {
    const result = await db.select().from(users).where(and(eq(users.email, email), eq(users.verification_code, code)));
    console.log("Verify Query Result:", result);

    // if (result.length === 0) return res.status(400).json({ message: 'Invalid code' });

    // await pool.query('UPDATE users SET is_verified = true, verification_code = NULL WHERE email = $1', [email]);

    // await db.update(users).set({ is_verified: true, verification_code: null }).where(eq(users.email, email));
    if(mainCode == code)
      res.json({ message: 'Email verified successfully' });
    res.json({message:"Email Not Verified"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const register = async (req, res) => {
  const { email, name, password, pincode } = req.body;
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = result;
    console.log("reg user ",email);

    if (!user || !user.is_verified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({
        name: name,
        password: hashed,
        pincode: pincode,
      })
      .where(eq(users.email, email));

    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = result[0];

    if (!user || !user.password) {
      return res.status(400).json({ message: 'Not registered' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
};

module.exports = {requestVerification, verifyEmail, register, login, getProfile};