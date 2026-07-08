import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/schema.js';
import db from './db/index.js';
import recipeRoutes from './routes/recipes.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize database
initDatabase();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/upload', uploadRoutes);

// Categories route (alias)
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.json({ success: true, data: categories });
});

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', error.message);
  res.status(500).json({ success: false, error: error.message || 'Server internal error' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API not found' });
});

export default app;
