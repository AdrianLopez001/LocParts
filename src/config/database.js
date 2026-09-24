const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

let pgClient = null;
let sqliteDb = null;
const DB_TYPE = process.env.DB_TYPE || (process.env.DB_HOST ? 'postgres' : 'sqlite');

// Caminho do banco SQLite embutido
const SQLITE_FILE = path.join(__dirname, '..', '..', 'autoquote.db');

function getSqliteDb() {
  if (!sqliteDb) {
    sqliteDb = new DatabaseSync(SQLITE_FILE);
  }
  return sqliteDb;
}

async function getPgPool() {
  if (!pgClient) {
    const { Pool } = require('pg');
    pgClient = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres_password',
      database: process.env.DB_NAME || 'autoquote',
      connectionTimeoutMillis: 2000
    });
  }
  return pgClient;
}

/**
 * Executa uma consulta agnóstica para SQLite e PostgreSQL
 */
async function query(sql, params = []) {
  if (DB_TYPE === 'postgres') {
    try {
      const pool = await getPgPool();
      // Converte ? de SQLite para $1, $2 do PostgreSQL se necessário
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex++}`);
      }
      const res = await pool.query(pgSql, params);
      return res.rows;
    } catch (err) {
      console.warn(`[DB] Falha na conexão PostgreSQL (${err.message}). Utilizando SQLite embutido como fallback.`);
    }
  }

  // SQLite fallback
  const db = getSqliteDb();
  const stmt = db.prepare(sql);
  
  if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH')) {
    return stmt.all(...params);
  } else {
    return stmt.run(...params);
  }
}

module.exports = {
  query,
  getSqliteDb,
  getPgPool,
  DB_TYPE,
  SQLITE_FILE
};
