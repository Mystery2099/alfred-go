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
    created_at text not null,
    updated_at text not null
  );
`)

export const db = drizzle(sqlite, { schema })
