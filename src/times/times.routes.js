import express from 'express'

import { logger } from '../logger.js'
import { authGuard } from '../auth/auth.middleware.js'
import { createTime, deleteTime, getMostRecentTimesForUser, getUserTimeMetrics, getTimeFrequencies } from './times.service.js'

export function getTimeRoutes({ db }) {
  const router = express.Router()

  router.post('/', [authGuard()], async (req, res) => {
    const seconds = req.body.seconds
    if (!isNaN(seconds)) {
      logger.info(`Saving time ${seconds}s for user ${req.user.username}`)
      await createTime(db, { userId: req.user.id, seconds })
    }
    res.redirect('/')
  })

  router.post('/:id/delete', [authGuard()], async (req, res) => {
    await deleteTime(db, req.user.id, req.params.id)
    const redirectTo = req.previousPage || '/'
    res.redirect(redirectTo)
  })

  router.get('/', [authGuard()], async (req, res) => {
    const times = await getMostRecentTimesForUser(db, req.user.id, 1000)
    res.render('pages/times', { times })
  })

  router.get('/metrics', [authGuard()], async (req, res) => {
    const metrics = await getUserTimeMetrics(db, req.user.id)

    res.render('pages/metrics', metrics)
  })

  router.get('/metrics/time-frequencies', [authGuard()], async (req, res) => {
    const timeFrequencies = await getTimeFrequencies(db, req.user.id)
    const [labels, values] = timeFrequencies.reduce((acc, next) => {
      acc[0].push(next['time_range'])
      acc[1].push(next['count'])
      return acc
    }, [[], []])
    res.json({ labels, series: [values] })
  })

  router.get('/metrics/time-trend', [authGuard()], async (req, res) => {
    const times = (await getMostRecentTimesForUser(db, req.user.id, 1000)).reverse()
    res.json({
      labels: times.map(time => time.createdAt),
      series: [times.map(time => time.seconds)]
    })
  })

  return router
}
