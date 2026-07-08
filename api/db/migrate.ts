/**
 * Migration script: Local SQLite + uploads/ → Turso + Cloudinary
 * Run: npx tsx api/db/migrate.ts
 */
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const rootDir = path.resolve(__dirname, '../..');

// Validate env
const { TURSO_URL, TURSO_AUTH_TOKEN, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!TURSO_URL || !CLOUDINARY_CLOUD_NAME) {
  console.error('Missing TURSO_URL or CLOUDINARY_CLOUD_NAME in .env');
  process.exit(1);
}

// Init Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Init Turso client
const turso = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

// Init local SQLite
const localDb = new Database(path.join(rootDir, 'data', 'recipes.db'));
localDb.pragma('journal_mode = WAL');

async function migrate() {
  console.log('=== Migration: Local → Turso + Cloudinary ===\n');

  // 1. Create tables on Turso
  console.log('1. Creating tables on Turso...');
  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0
  )`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    difficulty INTEGER DEFAULT 1,
    cook_time TEXT,
    cover_image TEXT,
    ingredients TEXT,
    steps TEXT,
    tips TEXT,
    dish_type TEXT DEFAULT '荤菜',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  // 2. Migrate categories
  console.log('2. Migrating categories...');
  const categories = localDb.prepare('SELECT * FROM categories ORDER BY sort_order').all() as any[];
  const catStmt = 'INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)';
  await turso.batch(categories.map(c => ({ sql: catStmt, args: [c.id, c.name, c.sort_order] })));
  console.log(`   ${categories.length} categories migrated`);

  // 3. Migrate images to Cloudinary
  console.log('3. Uploading images to Cloudinary...');
  const uploadsDir = path.join(rootDir, 'uploads');
  const imageMap: Record<string, string> = {}; // old path → new URL

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      try {
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'what-to-eat', resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            }
          );
          stream.end(fileBuffer);
        });
        imageMap[`/uploads/${file}`] = result.secure_url;
        console.log(`   ✓ ${file} → Cloudinary`);
      } catch (err: any) {
        console.log(`   ✗ ${file} failed: ${err.message}`);
      }
    }
  }
  console.log(`   ${Object.keys(imageMap).length} images uploaded\n`);

  // 4. Migrate recipes
  console.log('4. Migrating recipes...');
  const recipes = localDb.prepare('SELECT * FROM recipes ORDER BY id').all() as any[];

  const recipeStmt = `INSERT INTO recipes (id, name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const recipeStatements = recipes.map(r => ({
    sql: recipeStmt,
    args: [
      r.id, r.name, r.category_id, r.difficulty, r.cook_time,
      imageMap[r.cover_image] || r.cover_image, // replace local URLs with Cloudinary URLs
      r.ingredients, r.steps, r.tips, r.dish_type,
      r.created_at, r.updated_at
    ]
  }));

  await turso.batch(recipeStatements);
  console.log(`   ${recipes.length} recipes migrated\n`);

  // 5. Reset autoincrement
  const maxId = Math.max(...recipes.map((r: any) => r.id));
  await turso.execute(`INSERT INTO sqlite_sequence (name, seq) VALUES ('recipes', ?) ON CONFLICT(name) DO UPDATE SET seq = ?`, [maxId, maxId]);

  console.log('=== Migration complete! ===');
  console.log(`Images: ${Object.keys(imageMap).length} uploaded to Cloudinary`);
  console.log(`Recipes: ${recipes.length} migrated to Turso`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
