import shortid from 'shortid'

export async function createUserInDB(db, {username, passwordHash}) {
  const now = new Date()
  const time = now.getTime()
  const id = shortid.generate()
  const sql = `
    INSERT INTO users (
      id,
      username,
      password_hash,
      created_at,
      updated_at,
      last_login_at
    ) VALUES (?, ?, ?, ?, ?, ?);
  `
  await db.query(sql, [id, username, passwordHash, time, time, time])
  return {
    id,
    username,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  }
}

export async function findUserInDBByUsername(db, username) {
  const sql = 'SELECT * FROM users WHERE username = ? LIMIT 1;'
  const user = (await db.query(sql, [username]))[0]
  if (!user) return null
  return userFromRow(user)
}

export async function findUserInDBById(db, id) {
  const sql = 'SELECT * FROM users WHERE id = ?;'
  const user = (await db.query(sql, [id]))[0]
  if (!user) return null
  return userFromRow(user)
}

/** Create a user entity from a db row */
function userFromRow({
  id,
  username,
  password_hash,
  created_at,
  updated_at,
  last_login_at,
  role,
  disabled
}) {
  return {
    id,
    username,
    passwordHash: password_hash,
    createdAt: created_at,
    updatedAt: updated_at,
    lastLoginAt: last_login_at,
    role,
    disabled
  }
}
