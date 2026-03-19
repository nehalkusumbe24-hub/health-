import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Serve uploaded files publicly
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Mock chat edge function
app.post('/functions/v1/ayurvedic-chatbot', (req, res) => {
   res.json({ message: "This is a mock response from the simplified local Express chatbot! Hello from SQLite migration." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
