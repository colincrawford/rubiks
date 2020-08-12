import { 
  createTimeInDB,
  deleteTimeInDB,
  getMostRecentTimesForUserInDB,
  getTopTimesForUserInDB,
  getAverageTimeForUserInDB,
  getNumberOfTimesForUserInDB,
  getTimeFrequenciesInDB,
  getTimeString
} from './times.persistence.js'

export async function createTime(db, { userId, seconds }) {
  return createTimeInDB(db, {userId, seconds})
}

export async function deleteTime(db, userId, timeId) {
  return deleteTimeInDB(db, userId, timeId)
}

export async function getMostRecentTimesForUser(db, userId, number) {
  return getMostRecentTimesForUserInDB(db, userId, number)
}

export async function getTopTimesForUser(db, userId) {
  return getTopTimesForUserInDB(db, userId, 5)
}

export async function getUserTimeMetrics(db, userId) {
  const [bestTime, avgSeconds, numberOfTimes] = await Promise.all([
    getTopTimesForUserInDB(db, userId, 1),
    getAverageTimeForUserInDB(db, userId),
    getNumberOfTimesForUserInDB(db, userId),
  ])

  const bestTimeSeconds = bestTime[0] ? bestTime[0].time : '-'
  const averageTime = avgSeconds > 0 ? getTimeString(avgSeconds) : '-'
  const metrics = { bestTimeSeconds, averageTime, numberOfTimes }
  return metrics
}

export async function getTimeFrequencies(db, userId) {
  return getTimeFrequenciesInDB(db, userId)
}
