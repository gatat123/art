import pg from 'pg';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    console.log('🔄 Initializing database...');
    
    // 스키마 읽기 및 실행
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Schema created');
    
    // 관리자 계정 생성
    const adminUsername = process.env.ADMIN_USERNAME || 'HSG202';
    const adminPassword = process.env.ADMIN_PASSWORD || '1004mobil!#';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@studio.com';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (username) DO UPDATE
       SET password_hash = $3, role = $4`,
      [adminUsername, adminEmail, hashedPassword, 'admin']
    );
    
    console.log(`✅ Admin account created/updated: ${adminUsername}`);
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
