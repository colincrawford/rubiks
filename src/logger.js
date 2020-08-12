import os from 'os'
import winston from 'winston'
import morgan from 'morgan'

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.json(),
  }))
}

// configure request logging with morgan
morgan.token('request-id', function getId (req) {
  return req.id
})

morgan.token('session-id', function getId (req) {
  return req.session ? req.session.sessionId : ''
})

morgan.token('hostname', function getHostname() {
  return os.hostname()
})

morgan.token('pid', function getPid() {
  return process.pid
})

export const requestLogger = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      'remote-address': tokens['remote-addr'](req, res),
      'time': tokens['date'](req, res, 'iso'),
      'method': tokens['method'](req, res),
      'url': tokens['url'](req, res),
      'http-version': tokens['http-version'](req, res),
      'status-code': tokens['status'](req, res),
      'content-length': tokens['res'](req, res, 'content-length'),
      'referrer': tokens['referrer'](req, res),
      'user-agent': tokens['user-agent'](req, res),
      'request-id': tokens['request-id'](req, res),
      'session-id': tokens['session-id'](req, res),
      'hostname': tokens['hostname'](req, res),
      'pid': tokens['pid'](req, res)
    })
  }
  , {stream: {
    write: function(message) {
      logger.info('request received', JSON.parse(message))
    }}
  })
