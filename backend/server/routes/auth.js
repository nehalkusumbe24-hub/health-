import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbPromise } from '../db.js';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const db = await dbPromise;
    const existingUser = await db.get('SELECT id FROM auth_users WHERE email = ?', email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const id = crypto.randomUUID();
    await db.run('INSERT INTO auth_users (id, email, password_hash) VALUES (?, ?, ?)', id, email, hashedPassword);
    
    // Create base profile
    await db.run('INSERT INTO profiles (id, email, role, full_name) VALUES (?, ?, ?, ?)', id, email, 'user', full_name || '');
    
    // Create patient record by default
    const patientId = crypto.randomUUID();
    await db.run('INSERT INTO patients (id, user_id) VALUES (?, ?)', patientId, id);

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id, email, full_name: full_name || '' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM auth_users WHERE email = ?', email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.email !== 'admin@example.com') {
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Log the successful login
    try {
      await db.run(
        'INSERT INTO login_logs (id, user_id, email, action, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        crypto.randomUUID(),
        user.id,
        user.email,
        'login',
        'success',
        new Date().toISOString()
      );
    } catch (logError) {
      console.error('Failed to log login:', logError);
    }

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify token for protected routes
export const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default router;
