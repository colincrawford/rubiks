import express from 'express'
import shortid from 'shortid'

import { createUser, findUserByUsername, findUserByEmailAndPassword } from './user.service.js'

export function getAuthRoutes({ db }) {
  const router = express.Router()

  router.get('/sign-up', (req, res) => {
    if (req.user) {
      res.redirect('/')
      return
    }
    res.render('pages/sign-up')
  })

  router.post('/sign-up', async (req, res) => {
    const { username, password } = req.body

    const missingFields = []
    if (!username) missingFields.push('username')
    if (!password) missingFields.push('password')

    if (missingFields.length) {
      req.flashWarning('Please include ' + missingFields.join(', '))
      res.redirect('/sign-up')
      return
    }

    const existingUser = await findUserByUsername(db, username)
    if (existingUser) {
      req.flashWarning('Username Taken')
      res.redirect('/sign-up')
      return
    }

    const user = await createUser(db, {username, password})

    createSession(req, user)
    res.redirect('/')
  })

  router.get('/login', (req, res) => {
    if (req.user) {
      res.redirect('/')
      return
    }
    res.render('pages/login')
  })

  router.post('/login', async (req, res) => {
    const { username, password } = req.body

    const missingFields = []
    if (!username) missingFields.push('username')
    if (!password) missingFields.push('password')

    if (missingFields.length) {
      req.flashWarning('Please include ' + missingFields.join(', '))
      res.redirect('/login')
      return
    }

    const user = await findUserByEmailAndPassword(db, username, password)

    if (!user) {
      req.flashWarning('Invalid Credentials')
      res.redirect('/login')
      return
    }

    createSession(req, user)
    res.redirect('/')
  })

  router.get('/logout', (req, res) => {
    deleteSession(req)
    res.redirect('/login')
  })

  return router
}

function createSession(req, user) {
  req.session.userId = user.id
  req.session.sessionId = shortid.generate()
}

function deleteSession(req) {
  req.session = null
}
