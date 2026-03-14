import bcrypt from 'bcryptjs'
import pool from './pool.js'

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'admin@tubaraobjj.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(password, 10)

  const client = await pool.connect()
  try {
    const res = await client.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    )
    if (res.rows.length > 0) {
      console.log('Admin user already exists.')
      return
    }
    await client.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    )
    console.log('Admin user created:', email)
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
