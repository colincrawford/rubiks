import sqlite3 from 'sqlite3'

import { logger } from './logger.js'

const db = new sqlite3.Database('./sqlite3.db', (err) => {
  if (err) {
    logger.error(err.message)
  }
  logger.info('Connected to the sqlite3 db')
})

db.run('DROP TABLE IF EXISTS times;', () => {
  db.run('DROP TABLE IF EXISTS users;', () => {
    db.run(`
      CREATE TABLE IF NOT EXISTS times (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        seconds REAL NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, () => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          last_login_at INTEGER NOT NULL,
          disabled INTEGER NOT NULL DEFAULT 0
        )`, () => {
        const now = new Date()
        const time = now.getTime()
        db.run(`
          INSERT INTO users (id, username, password_hash, created_at, updated_at, last_login_at, disabled)
          VALUES ('abc', 'demo', '$2b$10$yuEs62dCL7syX0ZMb19x0ujA0ik3o23Lx19cgD/XE9.JYOmO6lp.e', ${time}, ${time}, ${time}, 0)
        `)
      })
    })
  })
})

async function all(sql, binds = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, binds, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

export default {
  query: all
}
