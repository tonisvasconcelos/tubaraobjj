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

ALTER TABLE branches ADD COLUMN IF NOT EXISTS has_parking BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS parking_address TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

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
ALTER TABLE training_schedules
  ADD COLUMN IF NOT EXISTS team_member_id INT REFERENCES team_members(id) ON DELETE SET NULL;

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

-- Trial booking slots (calendar availability)
CREATE TABLE IF NOT EXISTS trial_slots (
  id SERIAL PRIMARY KEY,
  branch_id INT REFERENCES branches(id) ON DELETE SET NULL,
  title VARCHAR(255),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
  is_published BOOLEAN DEFAULT true,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public reservations for trial slots
CREATE TABLE IF NOT EXISTS trial_reservations (
  id SERIAL PRIMARY KEY,
  trial_slot_id INT NOT NULL REFERENCES trial_slots(id) ON DELETE CASCADE,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  student_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  notes TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'confirmed',
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

ALTER TABLE plans ADD COLUMN IF NOT EXISTS allowed_training_days TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS allowed_training_times TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS supported_student_levels TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS allowed_branch_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS monthly_fee_brl DECIMAL(10,2);
UPDATE plans SET monthly_fee_brl = price WHERE monthly_fee_brl IS NULL;

-- Students (portal credentials managed by admin)
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  student_level VARCHAR(100),
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trial_reservations_student_id_fkey'
  ) THEN
    ALTER TABLE trial_reservations
      ADD CONSTRAINT trial_reservations_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Student to plan assignment history
CREATE TABLE IF NOT EXISTS student_plan_assignments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  plan_id INT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  custom_monthly_fee_brl DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student messages (student/admin communication)
CREATE TABLE IF NOT EXISTS student_messages (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_role VARCHAR(40) NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly invoices controlled by admin
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  plan_assignment_id INT REFERENCES student_plan_assignments(id) ON DELETE SET NULL,
  reference_month DATE NOT NULL,
  due_date DATE,
  amount_brl DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(60),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, reference_month)
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

-- Website analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'session_start', 'heartbeat', 'session_end')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  site_id TEXT NOT NULL DEFAULT 'default',
  session_id TEXT NOT NULL,
  user_id TEXT,
  page_path TEXT NOT NULL DEFAULT '',
  referrer TEXT,
  device_type TEXT,
  user_agent_family TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB
);

-- Website analytics sessions (realtime support)
CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL DEFAULT 'default',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  device_type TEXT,
  country_code TEXT,
  region TEXT,
  user_id TEXT
);

-- Website legal terms registry (public site)
CREATE TABLE IF NOT EXISTS website_terms (
  id SERIAL PRIMARY KEY,
  term_key VARCHAR(40) NOT NULL,
  locale VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(term_key, locale, version)
);

CREATE TABLE IF NOT EXISTS website_term_acceptances (
  id SERIAL PRIMARY KEY,
  visitor_id VARCHAR(120) NOT NULL,
  term_id INT REFERENCES website_terms(id) ON DELETE SET NULL,
  term_key VARCHAR(40) NOT NULL,
  term_version INT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT true,
  consent_scope VARCHAR(120),
  page_path VARCHAR(500),
  locale VARCHAR(10),
  ip VARCHAR(120),
  user_agent VARCHAR(512),
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_questionnaire_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_questionnaire_questions (
  id SERIAL PRIMARY KEY,
  template_id INT NOT NULL REFERENCES medical_questionnaire_templates(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  question_key VARCHAR(120) NOT NULL,
  label TEXT NOT NULL,
  question_type VARCHAR(40) NOT NULL DEFAULT 'boolean',
  is_required BOOLEAN NOT NULL DEFAULT true,
  options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, question_key)
);

CREATE TABLE IF NOT EXISTS medical_questionnaire_submissions (
  id SERIAL PRIMARY KEY,
  template_id INT NOT NULL REFERENCES medical_questionnaire_templates(id) ON DELETE RESTRICT,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  reservation_id INT REFERENCES trial_reservations(id) ON DELETE SET NULL,
  terms_accepted BOOLEAN,
  terms_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_questionnaire_answers (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES medical_questionnaire_submissions(id) ON DELETE CASCADE,
  question_id INT REFERENCES medical_questionnaire_questions(id) ON DELETE SET NULL,
  question_key VARCHAR(120) NOT NULL,
  answer_boolean BOOLEAN,
  answer_text TEXT,
  answer_option VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_website_terms_single_active
  ON website_terms(term_key, locale)
  WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_medical_questionnaire_single_active
  ON medical_questionnaire_templates((is_active))
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_website_term_acceptances_visitor
  ON website_term_acceptances(visitor_id, accepted_at DESC);

CREATE INDEX IF NOT EXISTS idx_website_term_acceptances_term
  ON website_term_acceptances(term_id, accepted_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_questionnaire_submissions_lead
  ON medical_questionnaire_submissions(lead_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_questionnaire_submissions_reservation
  ON medical_questionnaire_submissions(reservation_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_questionnaire_answers_submission
  ON medical_questionnaire_answers(submission_id);

DO $$
DECLARE
  v_template_id INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM medical_questionnaire_templates
    WHERE version = 1
  ) THEN
    INSERT INTO medical_questionnaire_templates (name, description, version, is_active, published_at)
    VALUES (
      'PAR-Q Padrão',
      'Questionário médico inicial para agendamento de aula experimental.',
      1,
      true,
      NOW()
    )
    RETURNING id INTO v_template_id;

    INSERT INTO medical_questionnaire_questions (template_id, sort_order, question_key, label, question_type, is_required)
    VALUES
      (v_template_id, 1, 'question_1', 'Algum médico já disse que você possui problema de coração e que só deve realizar atividade física supervisionada?', 'boolean', true),
      (v_template_id, 2, 'question_2', 'Você sente dor no peito quando pratica atividade física?', 'boolean', true),
      (v_template_id, 3, 'question_3', 'Você sentiu dor no peito no último mês sem estar praticando atividade física?', 'boolean', true),
      (v_template_id, 4, 'question_4', 'Você perde o equilíbrio por tontura ou já perdeu a consciência?', 'boolean', true),
      (v_template_id, 5, 'question_5', 'Você possui problema ósseo ou articular que pode piorar com atividade física?', 'boolean', true),
      (v_template_id, 6, 'question_6', 'Seu médico prescreveu medicamentos para pressão arterial ou problema cardíaco?', 'boolean', true),
      (v_template_id, 7, 'question_7', 'Você conhece outro motivo que impeça a prática de atividade física?', 'boolean', true),
      (v_template_id, 8, 'question_8', 'Você possui histórico de convulsão, desmaio ou crise epiléptica?', 'boolean', true),
      (v_template_id, 9, 'question_9', 'Você possui alguma alergia grave ou condição respiratória importante?', 'boolean', true),
      (v_template_id, 10, 'question_10', 'Nos últimos 12 meses você realizou cirurgia, internação ou tratamento médico relevante?', 'boolean', true),
      (v_template_id, 11, 'additional_info', 'Se respondeu SIM em alguma pergunta, descreva brevemente (opcional).', 'text', false);
  END IF;
END $$;

INSERT INTO website_terms (term_key, locale, title, content, version, is_active, published_at)
SELECT 'privacy', 'pt-BR', 'Política de Privacidade', 'Defina aqui o conteúdo da política de privacidade no painel administrativo.', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM website_terms WHERE term_key = 'privacy' AND locale = 'pt-BR' AND version = 1);

INSERT INTO website_terms (term_key, locale, title, content, version, is_active, published_at)
SELECT 'terms', 'pt-BR', 'Termos de Uso', 'Defina aqui o conteúdo dos termos de uso no painel administrativo.', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM website_terms WHERE term_key = 'terms' AND locale = 'pt-BR' AND version = 1);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trial_slots_starts_at ON trial_slots(starts_at);
CREATE INDEX IF NOT EXISTS idx_training_schedules_team_member ON training_schedules(team_member_id);
ALTER TABLE training_schedules ADD COLUMN IF NOT EXISTS target_public VARCHAR(24) NOT NULL DEFAULT 'unisex';
ALTER TABLE trial_slots ADD COLUMN IF NOT EXISTS team_member_id INT REFERENCES team_members(id) ON DELETE SET NULL;
ALTER TABLE trial_slots ADD COLUMN IF NOT EXISTS class_type VARCHAR(40) NOT NULL DEFAULT 'experimental_group';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS requested_class_type VARCHAR(40);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS requested_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS requested_time TIME;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS has_gi BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gi_size VARCHAR(10);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS has_previous_experience BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS experience_duration VARCHAR(120);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS current_belt VARCHAR(80);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_count SMALLINT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS previous_team VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gender VARCHAR(40);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS prefer_female_instructor BOOLEAN;
CREATE INDEX IF NOT EXISTS idx_trial_slots_team_member ON trial_slots(team_member_id);
CREATE INDEX IF NOT EXISTS idx_trial_reservations_slot ON trial_reservations(trial_slot_id);
CREATE INDEX IF NOT EXISTS idx_trial_reservations_email ON trial_reservations(email);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON student_plan_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reference_month ON invoices(reference_month);
CREATE INDEX IF NOT EXISTS idx_student_messages_student ON student_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON analytics_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_site_id ON analytics_events(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country_code ON analytics_events(country_code);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device_type ON analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_site_occurred ON analytics_events(site_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen_at ON analytics_sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_site_id ON analytics_sessions(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at);

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
