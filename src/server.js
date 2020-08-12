import http from 'http'
import express from 'express'
import terminus from '@godaddy/terminus'
import cookieSession from 'cookie-session'
import csurf from 'csurf'
import helmet from 'helmet'
import shortid from 'shortid'
import 'express-async-errors'

import { flashMiddleware } from '../libs/flashMiddleware.js'

import { requestLogger, logger } from './logger.js'
import { findUserById } from './auth/user.service.js'
import { getTimeRoutes } from './times/times.routes.js'
import { getAuthRoutes } from './auth/auth.routes.js'
import { getTimerRoutes } from './timer/timer.routes.js'

export function startServer(config, db) {
  const app = express()
  app.set('view engine', 'ejs')
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(express.static('public'))
  app.use(helmet())
  app.use(cookieSession({
    httpOnly: true,
    sameSite: true,
    secret: config.sessionSecret,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))
  app.use(flashMiddleware())
  app.use(csurf())

  app.use(requestIdMiddleware)
  app.use(requestLogger)
  app.use(setCSRFToken)
  app.use(setPreviousPage)
  app.use(setCurrentUser(db))

  app.use(getTimerRoutes({db}))
  app.use(getAuthRoutes({db}))
  app.use('/times', getTimeRoutes({db}))

  app.use(errorMiddleware)
  app.use(notFoundHandler)

  const server = http.createServer(app)

  terminus.createTerminus(server, {
    healthChecks: {
      '/healthcheck': healthCheck,
      verbatim: true
    },
    signals: ['SIGINT', 'SIGTERM', 'SIGUS2', 'SIGUSR1', 'uncaughtException', 'unhandledRejection'],
    beforeShutdown,
    onSignal,
    onShutdown,
    logger: logger.error
  })

  return new Promise((resolve) => {
    const s = server.listen(config.port, () => {
      logger.info(`Listening on port ${server.address().port}`)
      if (process.env.NODE_ENV === 'development') {
        logger.info(`http://localhost:${config.port}`)
      }
      const originalClose = server.close.bind(server)
      server.close = () => new Promise((r) => originalClose(r))
      resolve(s)
    })
  })
}

function beforeShutdown () {
  // given your readiness probes run every 5 second
  // may be worth using a bigger number so you won't
  // run into any race conditions
  return new Promise(resolve => setTimeout(resolve, 5000))
}

function onSignal () {
  logger.info('server is starting cleanup')
  return Promise.all([
    // your clean logic, like closing database connections
  ])
}

function onShutdown () {
  logger.info('cleanup finished, server is shutting down')
}

function healthCheck () {
  return Promise.resolve(
    // optionally include a resolve value to be included as
    // info in the health check response
  )
}

function requestIdMiddleware(req, res, next) {
  req.id = shortid.generate()
  next()
}

function setCSRFToken(req, res, next) {
  res.locals.csrfToken = req.csrfToken()
  next()
}

// Gives the route handlers access to the previous page the user visited
// (generally useful for redirecting back)
function setPreviousPage(req, res, next) {
  if (req.session.previousPage) {
    req.previousPage = req.session.previousPage
  }
  req.session.previousPage = req.baseUrl + req.path
  next()
}

function setCurrentUser(db) {
  return async function(req, res, next) {
    if (req.session.userId) {
      const user = await findUserById(db, req.session.userId)
      if (user) {
        req.user = user
        res.locals.user = user
      } else {
        delete req.session.userId
      }
    }
    next()
  }
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    next(error)
  } else {
    logger.error(error.message)
    res.status(500).render('pages/error.ejs', {env: process.env, error})
  }
}

function notFoundHandler(req, res) {
  res.status(404).render('pages/not-found')
}
