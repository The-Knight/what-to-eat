import { Router, Request, Response } from 'express';
import db from '../db/index.js';

const router = Router();

// Get all recipes (with optional category filter and search)
router.get('/', (req: Request, res: Response) => {
  const { category, search } = req.query;

  let query = `
    SELECT r.*, c.name as category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category && category !== '全部') {
    query += ' AND c.name = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND r.name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY r.created_at DESC';

  const recipes = db.prepare(query).all(...params);

  const parsed = recipes.map((r: any) => ({
    ...r,
    ingredients: JSON.parse(r.ingredients || '[]'),
    steps: JSON.parse(r.steps || '[]'),
  }));

  res.json({ success: true, data: parsed });
});

// Get categories
router.get('/categories/list', (req: Request, res: Response) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.json({ success: true, data: categories });
});

// Get single recipe
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const recipe = db.prepare(`
    SELECT r.*, c.name as category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `).get(id) as any;

  if (!recipe) {
    res.status(404).json({ success: false, error: '菜谱不存在' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      steps: JSON.parse(recipe.steps || '[]'),
    },
  });
});

// Create recipe
router.post('/', (req: Request, res: Response) => {
  const { name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type } = req.body;

  const result = db.prepare(`
    INSERT INTO recipes (name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    category_id || null,
    difficulty || 1,
    cook_time || '',
    cover_image || '',
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    tips || '',
    dish_type || '荤菜'
  );

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(result.lastInsertRowid) as any;
  res.json({
    success: true,
    data: {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      steps: JSON.parse(recipe.steps || '[]'),
    },
  });
});

// Update recipe
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type } = req.body;

  const existing = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ success: false, error: '菜谱不存在' });
    return;
  }

  db.prepare(`
    UPDATE recipes SET
      name = ?, category_id = ?, difficulty = ?, cook_time = ?,
      cover_image = ?, ingredients = ?, steps = ?, tips = ?,
      dish_type = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name,
    category_id || null,
    difficulty || 1,
    cook_time || '',
    cover_image || '',
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    tips || '',
    dish_type || '荤菜',
    id
  );

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as any;
  res.json({
    success: true,
    data: {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      steps: JSON.parse(recipe.steps || '[]'),
    },
  });
});

// Delete recipe
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(id);

  if (result.changes === 0) {
    res.status(404).json({ success: false, error: '菜谱不存在' });
    return;
  }

  res.json({ success: true, message: '删除成功' });
});

export default router;
