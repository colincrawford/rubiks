import config from './config.js'
import db from './src/db.js'
import { startServer } from './src/server.js'

startServer(config, db)
