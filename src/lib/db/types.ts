// src/lib/db/types.ts

/**
 * User entity type
 */
export interface User {
  id: string;
  email: string;
  email_verified_at?: Date | null;
  display_name: string;
  avatar_file_id?: string | null;
  role: 'owner' | 'admin' | 'member';
  external_id?: string | null;
  password_hash?: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

/**
 * Session entity type
 */
export interface Session {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  user_agent?: string | null;
  ip?: string | null;
  expires_at: Date;
  revoked_at?: Date | null;
  created_at: Date;
}

/**
 * Item entity type (example resource)
 */
export interface Item {
  id: string;
  owner_id: string;
  title: string;
  body?: string | null;
  status: 'draft' | 'active' | 'archived';
  tags?: string[] | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

/**
 * FileObject entity type
 */
export interface FileObject {
  id: string;
  owner_id: string;
  bucket_key: string;
  filename: string;
  content_type: string;
  bytes: number;
  checksum: string;
  created_at: Date;
}

/**
 * Notification entity type
 */
export interface Notification {
  id: string;
  user_id: string;
  category: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read_at?: Date | null;
  created_at: Date;
}