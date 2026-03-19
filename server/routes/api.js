import express from 'express';
import { dbPromise } from '../db.js';
import { verifyAuth } from './auth.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();
router.use(verifyAuth); // Protect all API routes

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Generic GET for any table
router.get('/data/:table', async (req, res) => {
  const table = req.params.table;
  const allowedTables = ['profiles', 'doctors', 'patients', 'appointments', 'medical_records', 'chat_messages', 'assessments', 'prescriptions', 'diet_plans', 'exercise_plans', 'habit_tracking'];
  
  if (!allowedTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });

  try {
    const db = await dbPromise;
    let query = `SELECT * FROM ${table}`;
    let params = [];
    
    const filters = [];
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'limit' && key !== 'order') {
        filters.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    if (filters.length > 0) {
      query += ` WHERE ${filters.join(' AND ')}`;
    }

    if (req.query.order) {
       const [col, dir] = req.query.order.split('.');
       query += ` ORDER BY ${col} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
    }

    if (req.query.limit) {
      query += " LIMIT ?";
      params.push(parseInt(req.query.limit));
    }

    const data = await db.all(query, ...params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic GET single item
router.get('/data/:table/:id', async (req, res) => {
    const table = req.params.table;
    const allowedTables = ['profiles', 'doctors', 'patients', 'appointments', 'medical_records', 'chat_messages', 'assessments', 'prescriptions', 'diet_plans', 'exercise_plans', 'habit_tracking'];
    if (!allowedTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });
  
    try {
      const db = await dbPromise;
      const data = await db.get(`SELECT * FROM ${table} WHERE id = ?`, req.params.id);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// Generic POST (insert)
router.post('/data/:table', async (req, res) => {
  const table = req.params.table;
  const allowedTables = ['profiles', 'doctors', 'patients', 'appointments', 'medical_records', 'chat_messages', 'assessments', 'prescriptions', 'diet_plans', 'exercise_plans', 'habit_tracking'];
  if (!allowedTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });

  try {
    const body = req.body;
    if (!body.id) body.id = crypto.randomUUID();

    const keys = Object.keys(body);
    const values = Object.values(body);
    const placeholders = keys.map(() => '?').join(', ');
    
    const db = await dbPromise;
    await db.run(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, ...values);
    
    const inserted = await db.get(`SELECT * FROM ${table} WHERE id = ?`, body.id);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic PUT (update)
router.put('/data/:table/:id', async (req, res) => {
    const table = req.params.table;
    const allowedTables = ['profiles', 'doctors', 'patients', 'appointments', 'medical_records', 'chat_messages', 'assessments', 'prescriptions', 'diet_plans', 'exercise_plans', 'habit_tracking'];
    if (!allowedTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });
  
    try {
      const body = { ...req.body };
      delete body.id; // Don't update ID

      const keys = Object.keys(body);
      const values = Object.values(body);
      
      if (keys.length === 0) return res.status(400).json({ error: 'Empty update body' });
  
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      
      const db = await dbPromise;
      await db.run(`UPDATE ${table} SET ${setClause} WHERE id = ?`, ...values, req.params.id);
      
      const updated = await db.get(`SELECT * FROM ${table} WHERE id = ?`, req.params.id);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

export default router;
