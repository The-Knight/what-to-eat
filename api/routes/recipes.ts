import { Router, Request, Response } from 'express';
import db from '../db/index.js';

const router = Router();

// Get all recipes (with optional category filter and search)
router.get('/', async (req: Request, res: Response) => {
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

  const result = await db.execute(query, params);

  const parsed = result.rows.map((r: any) => ({
    ...r,
    ingredients: JSON.parse(r.ingredients || '[]'),
    steps: JSON.parse(r.steps || '[]'),
  }));

  res.json({ success: true, data: parsed });
});

// Get categories
router.get('/categories/list', async (req: Request, res: Response) => {
  const result = await db.execute('SELECT * FROM categories ORDER BY sort_order');
  res.json({ success: true, data: result.rows });
});

// Get single recipe
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await db.execute(`
    SELECT r.*, c.name as category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ success: false, error: '菜谱不存在' });
    return;
  }

  const recipe = result.rows[0];
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
router.post('/', async (req: Request, res: Response) => {
  const { name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type } = req.body;

  const result = await db.execute(`
    INSERT INTO recipes (name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name,
    category_id || null,
    difficulty || 1,
    cook_time || '',
    cover_image || '',
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    tips || '',
    dish_type || '荤菜'
  ]);

  const insertedId = result.lastInsertRowid;
  const recipeResult = await db.execute('SELECT * FROM recipes WHERE id = ?', [insertedId]);
  const recipe = recipeResult.rows[0];

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
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type } = req.body;

  const existing = await db.execute('SELECT * FROM recipes WHERE id = ?', [id]);
  if (existing.rows.length === 0) {
    res.status(404).json({ success: false, error: '菜谱不存在' });
    return;
  }

  await db.execute(`
    UPDATE recipes SET
      name = ?, category_id = ?, difficulty = ?, cook_time = ?,
      cover_image = ?, ingredients = ?, steps = ?, tips = ?,
      dish_type = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
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
  ]);

  const recipeResult = await db.execute('SELECT * FROM recipes WHERE id = ?', [id]);
  const recipe = recipeResult.rows[0];

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
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await db.execute('DELETE FROM recipes WHERE id = ?', [id]);

  if (result.rowsAffected === 0) {
    res.status(404).json({ success: false, error: '菜谱不存在' });
    return;
  }

  res.json({ success: true, message: '删除成功' });
});

export default router;
