/*
 ** SCRIPT
 ** npm run seed -- -i/-d/-t
 */

const { performance } = require('perf_hooks');
const { config } = require('dotenv');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { query, getClient, closePool } = require('./db');

config({ path: './.env.local' });
const NODE_ENV = process.env.NODE_ENV || 'development';


// Create extensions, triggers, types, and tables
async function createExtensions() {
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log('SUCCESS: Created uuid-ossp extension.');
  } catch (error) {
    console.error('ERROR: Creating extensions.', error);
    throw error;
  }
}

async function createTriggerFunctions() {
  try {
    await query(`CREATE OR REPLACE FUNCTION update_modified_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.modified_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('SUCCESS: Created trigger functions.');
  } catch (error) {
    console.error('ERROR: Creating trigger functions.', error);
    throw error;
  }
}

async function createEnums() {
  const client = await getClient();

  try {
    await client.query('BEGIN;');
    await client.query(`CREATE TYPE BROWSER as ENUM('Chrome', 'Firefox', 'Edge', 'Safari', 'Other', 'Unknown');`);
    await client.query(`CREATE TYPE DEVICE as ENUM('Desktop', 'Mobile', 'Tablet', 'Other', 'Unknown');`);
    await client.query('COMMIT;');
    console.log('SUCCESS: Created ENUM types.');
  } catch (error) {
    await client.query('ROLLBACK;');
    console.error('ERROR: Creating ENUM types.', error);
    throw error;
  } finally {
    client.release();
    console.log('LOG: Client released back to pool.');
  }
}

async function createUsersTable() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS users (
      user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email VARCHAR(100) CONSTRAINT unique_email NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    console.log('SUCCESS: Created users table.');
  } catch (error) {
    console.error('ERROR: Creating users table.', error);
    throw error;
  }
}

async function createSlugsTable() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS slugs (
      slug_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID,
      url VARCHAR(255),
      slug_hash VARCHAR(12),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );`)
    console.log('SUCCESS: Created slugs table.');
  } catch (error) {
    console.error('ERROR: Creating slugs table.', error);
    throw error;
  }
}

async function createLoggingTable() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS logging (
      logging_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID,
      slug_id UUID NOT NULL,
      browser VARCHAR(25),
      device VARCHAR(25),
      os VARCHAR(25),
      cpu VARCHAR(25),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_slug FOREIGN KEY (slug_id) REFERENCES slugs(slug_id) ON DELETE CASCADE,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );`)
    console.log('SUCCESS: Created logging table.');
  } catch (error) {
    console.error('ERROR: Creating logging table.', error);
    throw error;
  }
}

async function createTriggers() {
  const client = await getClient();

  try {
    await client.query('BEGIN;');

    await client.query(`CREATE OR REPLACE TRIGGER user_modified
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_at();
    `);
    await client.query(`CREATE OR REPLACE TRIGGER slug_modified
      BEFORE UPDATE ON slugs
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_at();
    `);
    await client.query(`CREATE OR REPLACE TRIGGER logging_modified
      BEFORE UPDATE ON logging
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_at();
    `);

    await client.query('COMMIT;');
    console.log('SUCCESS: Trigger functions applied to tables.');
  } catch (error) {
    await client.query('ROLLBACK;');
    console.error(
      "ERROR: Creating triggers for tables' 'modified' fields.",
      error,
    );
    throw error;
  } finally {
    client.release();
    console.log('LOG: Client released back to pool.');
  }
}

async function importData() {
  console.log('LOG: Importing data...');
  try {
    await createExtensions();
    await createTriggerFunctions();
    await createEnums();
    await createUsersTable();
    await createSlugsTable();
    await createLoggingTable();
    await createTriggers();
    console.log('SUCCESS: Data imported.');
  } catch (error) {
    console.error(
      'ERROR: An error occurred while importing the database. Did rollback occur?',
      error,
    );
  }
}

// Delete extensions, triggers, and tables
async function deleteData() {
  console.log('LOG: Deleting data...');
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(`
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS slugs CASCADE;
      DROP TABLE IF EXISTS logging CASCADE;
      DROP FUNCTION IF EXISTS update_modified_at();
      DROP EXTENSION IF EXISTS "uuid-ossp";
      DROP TYPE IF EXISTS BROWSER;
      DROP TYPE IF EXISTS DEVICE;
    `);
    await client.query('COMMIT;');
    console.log('SUCCESS: Data deleted.');
  } catch (error) {
    await client.query('ROLLBACK;');
    console.error(
      'ERROR: An error occurred while deleting the database.',
      error,
    );
  } finally {
    client.release();
    console.log('LOG: Client released back to pool.');
  }
}

async function testConnection() {
  console.log('LOG: Testing database connection...');
  try {
    const result = await query(`SELECT now();`);
    console.log('SUCCESS: Connection successful.', result.rows[0]);
  } catch (error) {
    console.error('ERROR: Connection failed.', error);
    throw error;
  }
}

async function main() {
  const startTime = performance.now();
  console.log(`Start Function: Running Database Seed Script`);

  switch (process.argv[2]) {
    case '-i':
      console.log('... Argument: Import');
      await importData();
      break;
    case '-d':
      console.log('... Argument: Delete');
      await deleteData();
      break;
    case '-t':
      console.log('... Argument: Test Connection');
      await testConnection();
      break;
    default:
      break;
  }

  const endTime = performance.now();
  console.log(
    'End Function: Finished Database Seed Script: ',
    (endTime - startTime).toFixed(3) + ' ms',
  );

  await closePool();
  console.log('LOG: Database pool closed.');
  process.exit(0);
}

async function runSeedScript() {
  try {
    await main();
  } catch (error) {
    console.error(
      'ERROR: An error occurred while seeding the database.',
      error,
    );
    try {
      await closePool();
      console.log('LOG: Database pool closed.');
    } catch (poolError) {
      console.error('ERROR: Failed to close the database pool.', poolError);
    }
    process.exit(1);
  }
}

async function confirmProductionRun() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input, output });

    rl.question(
      `Are you sure you want to run this in ${NODE_ENV}? (Y/n): `,
      (answer) => {
        rl.close();
        resolve(answer === 'Y');
      },
    );
  });
}

(async () => {
  if (NODE_ENV === 'production') {
    const confirmed = await confirmProductionRun();
    if (!confirmed) {
      console.log('Aborting seed script.');
      process.exit(1);
    }
  }

  await runSeedScript();
})();
