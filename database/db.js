const { Pool } = require('pg');
const { config } = require('dotenv');

config({ path: './.env.local' });


let poolConfig;

/** Definitions
 ** @param connectionTimeoutMillis
 ** Number of milliseconds to wait for connection; Default is no timeout
 ** @param idleTimeoutMillis
 ** Number of milliseconds before an idle client is disconnected from the backend and discarded
 ** Default is 10000 (10s); set to 0 to disable auto-disconnection of idle clients
 */
switch (process.env.NODE_ENV) {
  case 'development':
    poolConfig = {
      host: process.env.LOCAL_DB_HOST,
      port: parseInt(process.env.LOCAL_DB_PORT),
      user: process.env.LOCAL_DB_USER,
      database: process.env.LOCAL_DB_NAME,
      password: process.env.LOCAL_DB_PASSWORD,
      application_name: 'short-earl_dev',
    };
    break;
  case 'production':
    poolConfig = {
      host: process.env.PROD_DB_HOST,
      port: parseInt(process.env.PROD_DB_PORT),
      user: process.env.PROD_DB_USER,
      database: process.env.PROD_DB_NAME,
      password: process.env.PROD_DB_PASSWORD,
      ssl: {
        rejectUnauthorized: true,
        ca: process.env.PROD_DB_SSL_CERT,
      },
      max: 20,
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 30000,
      application_name: 'short-earl_prod',
    };
    break;
  default:
    break;
}

const pool = new Pool(poolConfig);

pool.on('error', (error) => {
  const poolStats = {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
  console.log('DB Idle Connection Error', poolStats, error)
});

/**
 ** Run a simple query; Client connection and release are automatic.
 */
async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('ERROR: Database query failed:', error);
    throw error;
  }
}

/**
 ** Get a database client for transactions.
 */
async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('ERROR: Failed to connect database client:', error);
    throw error;
  }
}

/**
 ** Close the database pool.
 */
async function closePool() {
  try {
    await pool.end();
    console.log('Pool was closed.')
    return;
  } catch (error) {
    console.error('ERROR: Could not close database pool:', error);
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Closing pool...`);
  try {
    await closePool();
  } catch (error) {
    console.error('Error closing pool during shutdown:', error);
  } finally {
    process.exit(0);
  }
}

// Handle SIGTERM to gracefully terminate open pools and conncetions.
// Especially useful during local development.
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = {
  query,
  getClient,
  closePool,
};
