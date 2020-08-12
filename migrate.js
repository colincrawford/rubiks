import Postgrator from 'postgrator'

import config  from './config.js'

const postgrator = new Postgrator({
  migrationDirectory: __dirname + '/migrations',
  driver: 'pg',
  host: '127.0.0.1',
  port: 5432,
  database: 'databasename',
  username: 'username',
  password: 'password',
  schemaTable: 'migrations',
})

// Migrate to max version (optionally can provide 'max')
postgrator
  .migrate()
  .then((appliedMigrations) => console.log(appliedMigrations))
  .catch((error) => console.log(error))
