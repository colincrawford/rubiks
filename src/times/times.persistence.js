import shortid from 'shortid'

export async function createTimeInDB(db, {userId, seconds}) {
  const now = new Date()
  const time = now.getTime()
  const id = shortid.generate()
  const sql = `
    INSERT INTO times (id, user_id, seconds, created_at)
    VALUES (?, ?, ?, ?);
  `
  await db.query(sql, [id, userId, seconds, time])
  return {id, userId, seconds, createdAt: now, time: getTimeString(seconds)}
}

export async function deleteTimeInDB(db, userId, id) {
  const sql = 'DELETE FROM times WHERE user_id = ? AND id = ?'
  return db.query(sql, [userId, id])
}

export async function getNumberOfTimesForUserInDB(db, userId) {
  const sql = `
    SELECT COUNT(*) number_of_times
    FROM times
    WHERE user_id = ?;
  `
  const result = await db.query(sql, [userId])
  return result[0].number_of_times
}

export async function getAverageTimeForUserInDB(db, userId) {
  const sql = `
    SELECT AVG(seconds) average_seconds
    FROM times
    WHERE user_id = ?;
  `
  const result = await db.query(sql, [userId])
  return result[0].average_seconds
}

export async function getMostRecentTimesForUserInDB(db, userId, number) {
  const sql = `
    SELECT * FROM times
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?;
  `
  const times = await db.query(sql, [userId, number])
  return times.map(timeFromRow)
}

export async function getTopTimesForUserInDB(db, userId, number) {
  const sql = `
    SELECT * FROM times
    WHERE user_id = ?
    ORDER BY seconds ASC
    LIMIT ?;`
  const times = await db.query(sql, [userId, number])
  return times.map(timeFromRow)
}

export async function getTimeFrequenciesInDB(db, userId) {
  const sql = `
    WITH time_ranges as (
      SELECT (
        CASE
          when seconds < 10 then "< 10 seconds"
          when seconds >= 10 and seconds < 20 then "10 - 19 seconds"
          when seconds >= 20 and seconds < 30 then "20 - 29 seconds"
          when seconds >= 30 and seconds < 40 then "30 - 39 seconds"
          when seconds >= 40 and seconds < 50 then "40 - 49 seconds"
          when seconds >= 50 and seconds < 60 then "50 - 59 seconds"
        END
      ) as time_range,
      seconds
      FROM times
      WHERE user_id = ?
    )
    SELECT time_range, count(time_range) as count, min(seconds) as min_time
    FROM time_ranges
    GROUP BY time_range
    ORDER BY min_time ASC
  `
  const result = await db.query(sql, [userId])
  return result || []
}

function timeFromRow({id, user_id, seconds, created_at}) {
  const createdAt = new Date(created_at)
  return { id, userId: user_id, seconds, createdAt, time: getTimeString(seconds) }
}

export function getTimeString(seconds) {
  if (isNaN(seconds)) return seconds
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds - (minutes * 60))
  const ms = Math.floor((seconds - secs) * 100)
  const minPrefix = minutes > 9 ? '' : '0'
  const secPrefix = secs > 9 ? '' : '0'
  const msPrefix = ms > 9 ? '' : '0'
  return `${minPrefix}${minutes}:${secPrefix}${secs}:${msPrefix}${ms}`
}

