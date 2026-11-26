-- Ownership dimension: users own lists, lists own items.
-- V1 seeds one default user + list; V3 activates real users without a schema change.
CREATE TABLE users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Global, read-only (from the app's point of view). Managed via the seed script.
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(50) NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  name        varchar(100) NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency    char(3) NOT NULL DEFAULT 'ZAR',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX items_list_category_idx ON items (list_id, category_id);

-- Implicit single user + list for V1.
INSERT INTO users (id, display_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default user');

INSERT INTO lists (id, owner_id, name)
VALUES ('00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'My groceries');