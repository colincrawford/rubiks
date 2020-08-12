import express from 'express'

import { getTopTimesForUser } from '../times/times.service.js'
import { authGuard } from '../auth/auth.middleware.js'

export function getTimerRoutes({ db }) {
  const router = express.Router()

  router.get('/', [authGuard()], async (req, res) => {
    const times = await getTopTimesForUser(db, req.user.id)
    res.render('pages/timer', { times })
  })

  return router
}
