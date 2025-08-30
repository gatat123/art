import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, email, role, avatar_url, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
});

// 활동 내역 조회
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: '활동 내역 조회 중 오류가 발생했습니다.' });
  }
});

// 프로필 업데이트
router.patch('/profile', authenticateToken, async (req, res) => {
  const { username, email, avatar_url } = req.body;
  
  try {
    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];
    
    if (username !== undefined) {
      updates.push(`username = $${values.length + 1}`);
      values.push(username);
    }
    
    if (email !== undefined) {
      updates.push(`email = $${values.length + 1}`);
      values.push(email);
    }
    
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${values.length + 1}`);
      values.push(avatar_url);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '수정할 내용이 없습니다.' });
    }
    
    query += updates.join(', ');
    query += ` WHERE id = $${values.length + 1} RETURNING id, username, email, role, avatar_url, created_at`;
    values.push(req.user.id);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: '이미 사용 중인 사용자명 또는 이메일입니다.' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: '프로필 수정 중 오류가 발생했습니다.' });
  }
});

export default router;