import { Pool } from 'pg';

// Convert environment string value to number
const envDatabasePort = parseInt(process.env.DATABASE_PORT || '');
const DATABASE_PORT = Number.isInteger(envDatabasePort)
  ? envDatabasePort
  : undefined;

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: DATABASE_PORT,
  ssl:
    process.env.NODE_ENV === 'development'
      ? undefined
      : {
          rejectUnauthorized: false,
        },
});

export default pool;
