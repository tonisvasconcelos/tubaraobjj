import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
const isNeon = connectionString && connectionString.includes('neon.tech')

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ...(isNeon && { ssl: { rejectUnauthorized: true } }),
})

export default pool
