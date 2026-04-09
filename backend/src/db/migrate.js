import pool from './pool.js'

const SQL = `
-- Admin user (single user for now)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members (professors/instructors)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url VARCHAR(1024),
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches (addresses)
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  photo_url VARCHAR(1024),
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(1024),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  whatsapp_link VARCHAR(1024),
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (color, size, stock)
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color VARCHAR(100),
  size VARCHAR(100),
  stock_quantity INT NOT NULL DEFAULT 0,
  UNIQUE(product_id, color, size)
);

-- Contacts (messages from website)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Highlights (Destaques on homepage)
CREATE TABLE IF NOT EXISTS highlights (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) DEFAULT 'News',
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url VARCHAR(1024),
  author VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training schedule (Horários)
CREATE TABLE IF NOT EXISTS training_schedules (
  id SERIAL PRIMARY KEY,
  branch_name VARCHAR(255) NOT NULL,
  training_type VARCHAR(255) NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (trial class funnel)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  interest_program VARCHAR(120),
  preferred_time VARCHAR(120),
  notes TEXT,
  source VARCHAR(100) DEFAULT 'website',
  status VARCHAR(40) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (commerce identity)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(100),
  document VARCHAR(40),
  provider_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membership plans
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle VARCHAR(40) NOT NULL DEFAULT 'monthly',
  trial_days INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_type VARCHAR(40) NOT NULL DEFAULT 'product',
  currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  provider VARCHAR(60),
  provider_order_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(40) NOT NULL DEFAULT 'product',
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  product_variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
  plan_id INT REFERENCES plans(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider VARCHAR(60) NOT NULL,
  provider_payment_id VARCHAR(255),
  method VARCHAR(60),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id INT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  provider VARCHAR(60) NOT NULL DEFAULT 'mercadopago',
  provider_subscription_id VARCHAR(255),
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events for idempotency and audit
CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(60) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(120),
  payload JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(40) NOT NULL DEFAULT 'received',
  error_message VARCHAR(500),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, event_id)
);

-- Coupons (future-ready)
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'percent',
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional social proof and SEO metadata entities
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  program VARCHAR(120),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  meta_description VARCHAR(320),
  canonical VARCHAR(1024),
  og_image VARCHAR(1024),
  json_ld JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Gallery feature removed: drop legacy table if it exists
DROP TABLE IF EXISTS gallery_items;
`

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(SQL)
    console.log('Migration completed.')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
