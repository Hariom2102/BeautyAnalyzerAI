import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isPostgres = !!process.env.DATABASE_URL;

let dbSqlite = null;
let pgPool = null;

if (isPostgres) {
  console.log('🐘 Initializing PostgreSQL database connection pool...');
  const sslConfig = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false };

  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
  });

  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
} else {
  const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'beauty_analyzer.db');
  sqlite3.verbose();
  dbSqlite = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database at:', dbPath);
    }
  });
}

// Convert '?' parameters to '$1, $2, ...' for Postgres
function preparePostgresQuery(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

async function runAsync(sql, params = []) {
  if (isPostgres) {
    const pgSql = preparePostgresQuery(sql);
    const res = await pgPool.query(pgSql, params);
    return { changes: res.rowCount };
  } else {
    return new Promise((resolve, reject) => {
      dbSqlite.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
}

async function allAsync(sql, params = []) {
  if (isPostgres) {
    const pgSql = preparePostgresQuery(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    return new Promise((resolve, reject) => {
      dbSqlite.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

async function getAsync(sql, params = []) {
  if (isPostgres) {
    const pgSql = preparePostgresQuery(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      dbSqlite.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

// Initialize Database Tables
async function initTables() {
  try {
    if (isPostgres) {
      await runAsync(`
        CREATE TABLE IF NOT EXISTS analyses (
          id VARCHAR(255) PRIMARY KEY,
          beauty_score INT NOT NULL,
          symmetry_score INT NOT NULL,
          smile_score INT NOT NULL,
          confidence_score INT NOT NULL,
          pitch_angle INT DEFAULT 0,
          yaw_angle INT DEFAULT 0,
          roll_angle INT DEFAULT 0,
          landmarks_json TEXT,
          suggestions_json TEXT,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT
        );
      `);

      console.log('🐘 PostgreSQL database tables initialized successfully.');
    } else {
      await runAsync(`PRAGMA journal_mode = WAL;`);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          beauty_score INTEGER NOT NULL,
          symmetry_score INTEGER NOT NULL,
          smile_score INTEGER NOT NULL,
          confidence_score INTEGER NOT NULL,
          pitch_angle INTEGER DEFAULT 0,
          yaw_angle INTEGER DEFAULT 0,
          roll_angle INTEGER DEFAULT 0,
          landmarks_json TEXT,
          suggestions_json TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await runAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

      console.log('💾 SQLite database tables verified/created successfully.');
    }
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

initTables();

/* ==========================================================================
   CRUD Operations for Analyses
   ========================================================================== */

export async function saveAnalysis(analysisData) {
  const {
    id = 'analysis_' + Date.now(),
    beautyScore = 0,
    symmetryScore = 0,
    smileScore = 0,
    confidenceScore = 0,
    faceAngle = {},
    landmarks = {},
    suggestions = [],
    image = ''
  } = analysisData;

  const sql = `
    INSERT INTO analyses (
      id, beauty_score, symmetry_score, smile_score, confidence_score,
      pitch_angle, yaw_angle, roll_angle, landmarks_json, suggestions_json, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      beauty_score = excluded.beauty_score,
      symmetry_score = excluded.symmetry_score,
      smile_score = excluded.smile_score,
      confidence_score = excluded.confidence_score,
      pitch_angle = excluded.pitch_angle,
      yaw_angle = excluded.yaw_angle,
      roll_angle = excluded.roll_angle,
      landmarks_json = excluded.landmarks_json,
      suggestions_json = excluded.suggestions_json,
      image_url = excluded.image_url;
  `;

  const params = [
    id,
    beautyScore,
    symmetryScore,
    smileScore,
    confidenceScore,
    faceAngle.pitch || 0,
    faceAngle.yaw || 0,
    faceAngle.roll || 0,
    JSON.stringify(landmarks),
    JSON.stringify(suggestions),
    image
  ];

  await runAsync(sql, params);
  return getAnalysisById(id);
}

export async function getAllAnalyses() {
  const rows = await allAsync(`SELECT * FROM analyses ORDER BY created_at DESC`);
  return rows.map(formatAnalysisRow);
}

export async function getAnalysisById(id) {
  const row = await getAsync(`SELECT * FROM analyses WHERE id = ?`, [id]);
  return row ? formatAnalysisRow(row) : null;
}

export async function deleteAnalysis(id) {
  const res = await runAsync(`DELETE FROM analyses WHERE id = ?`, [id]);
  return res.changes > 0;
}

export async function clearAllAnalyses() {
  await runAsync(`DELETE FROM analyses`);
  return true;
}

export async function getAnalyticsStats() {
  const countRow = await getAsync(`SELECT COUNT(*) as total_scans FROM analyses`);
  const avgRow = await getAsync(`
    SELECT 
      AVG(beauty_score) as avg_beauty,
      AVG(symmetry_score) as avg_symmetry,
      AVG(smile_score) as avg_smile,
      MAX(beauty_score) as max_beauty,
      MIN(beauty_score) as min_beauty
    FROM analyses
  `);

  const totalScans = countRow ? parseInt(countRow.total_scans || 0, 10) : 0;
  const avgBeauty = avgRow && avgRow.avg_beauty ? parseFloat(avgRow.avg_beauty) : 0;
  const avgSymmetry = avgRow && avgRow.avg_symmetry ? parseFloat(avgRow.avg_symmetry) : 0;
  const avgSmile = avgRow && avgRow.avg_smile ? parseFloat(avgRow.avg_smile) : 0;
  const maxBeauty = avgRow && avgRow.max_beauty !== null ? parseInt(avgRow.max_beauty, 10) : 0;
  const minBeauty = avgRow && avgRow.min_beauty !== null ? parseInt(avgRow.min_beauty, 10) : 0;

  return {
    totalScans,
    averageBeautyScore: Math.round(avgBeauty),
    averageSymmetryScore: Math.round(avgSymmetry),
    averageSmileScore: Math.round(avgSmile),
    highestBeautyScore: maxBeauty,
    lowestBeautyScore: minBeauty
  };
}

/* ==========================================================================
   Settings Management
   ========================================================================== */

export async function getSettings() {
  const rows = await allAsync(`SELECT * FROM settings`);
  const settingsObj = { botToken: '', chatId: '', adminPassword: '' };
  rows.forEach(r => {
    settingsObj[r.key] = r.value;
  });
  return settingsObj;
}

export async function saveSettings(settingsObj) {
  for (const [key, value] of Object.entries(settingsObj)) {
    await runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, String(value)]
    );
  }
  return getSettings();
}

/* Helper to map DB row to frontend object format */
function formatAnalysisRow(row) {
  let landmarks = {};
  let suggestions = [];
  try { landmarks = typeof row.landmarks_json === 'string' ? JSON.parse(row.landmarks_json || '{}') : (row.landmarks_json || {}); } catch (e) {}
  try { suggestions = typeof row.suggestions_json === 'string' ? JSON.parse(row.suggestions_json || '[]') : (row.suggestions_json || []); } catch (e) {}

  return {
    id: row.id,
    beautyScore: row.beauty_score,
    symmetryScore: row.symmetry_score,
    smileScore: row.smile_score,
    confidenceScore: row.confidence_score,
    faceAngle: {
      pitch: row.pitch_angle,
      yaw: row.yaw_angle,
      roll: row.roll_angle
    },
    landmarks,
    suggestions,
    image: row.image_url,
    timestamp: row.created_at
  };
}
