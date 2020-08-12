import { createUserInDB, findUserInDBByUsername, findUserInDBById } from './user.persistence.js'
import { hashPassword, passwordsMatch } from './hashing.service.js'

export async function createUser(db, {username, password}) {
  const passwordHash = await hashPassword(password)
  return createUserInDB(db, {username, passwordHash})
}

export async function findUserByUsername(db, username) {
  return findUserInDBByUsername(db, username)
}

export async function findUserByEmailAndPassword(db, username, password) {
  const user = await findUserByUsername(db, username)
  if (!user) return null

  const validPass = await passwordsMatch(password, user.passwordHash)
  if (!validPass) return null

  return user
}

export async function findUserById(db, id) {
  return findUserInDBById(db, id)
}
