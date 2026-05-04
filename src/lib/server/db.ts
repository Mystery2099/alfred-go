import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database(process.env.DATABASE_URL || 'alfredgo.sqlite')

sqlite.exec(`
  create table if not exists users (
    id text primary key,
    name text not null,
    email text,
    role text not null,
    created_at text not null,
    updated_at text not null
  );
  create table if not exists user_credentials (
    user_id text primary key,
    email text not null unique,
    password_hash text not null,
    created_at text not null,
    updated_at text not null
  );
  create table if not exists categories (
    id text primary key,
    name text not null,
    description text,
    parent_category_id text,
    sort_order integer not null,
    created_at text not null,
    updated_at text not null
  );
  create table if not exists tools (
    id text primary key,
    name text not null,
    description text not null,
    url text not null,
    category_id text not null,
    icon text,
    tags text not null,
    audience_roles text not null,
    is_featured integer not null,
    is_active integer not null,
    created_at text not null,
    updated_at text not null
  );
  create table if not exists favorites (
    id text primary key,
    user_id text not null,
    tool_id text not null,
    created_at text not null,
    unique(user_id, tool_id)
  );
  create table if not exists user_preferences (
    id text primary key,
    user_id text not null,
    dashboard_layout text,
    theme text not null,
    preferred_role_view text,
    notification_settings text,
    created_at text not null,
    updated_at text not null
  );
  create table if not exists announcements (
    id text primary key,
    title text not null,
    body text not null,
    tone text not null,
    filter text not null,
    action_label text,
    tool_id text,
    url text,
    sort_order integer not null,
    is_active integer not null,
    created_at text not null,
    updated_at text not null
  );
  create table if not exists activities (
    id text primary key,
    user_id text not null,
    type text not null,
    tool_id text,
    tool_name text,
    created_at text not null
  );
`)

try {
  sqlite.exec(`ALTER TABLE user_preferences ADD COLUMN notification_settings TEXT;`)
} catch {
  // column may already exist
}

sqlite.exec(`
  create table if not exists push_subscriptions (
    id text primary key,
    user_id text,
    endpoint text not null,
    p256dh text not null,
    auth text not null,
    created_at text not null
  );
`)

export const db = drizzle(sqlite, { schema })
