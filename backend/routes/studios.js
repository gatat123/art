import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 스튜디오 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, u.username as creator_name,
        COUNT(DISTINCT sm.user_id) as member_count,
        COUNT(DISTINCT p.id) as project_count
      FROM studios s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN studio_members sm ON s.id = sm.studio_id
      LEFT JOIN projects p ON s.id = p.studio_id
      WHERE s.id IN (
        SELECT studio_id FROM studio_members WHERE user_id = $1
      )
      GROUP BY s.id, u.username
      ORDER BY s.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get studios error:', error);
    res.status(500).json({ error: '스튜디오 목록을 가져올 수 없습니다.' });
  }
});
// 스튜디오 생성
router.post('/', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 스튜디오 생성
      const studioResult = await client.query(
        `INSERT INTO studios (name, description, created_by) 
         VALUES ($1, $2, $3) RETURNING *`,
        [name, description, req.user.id]
      );
      
      const studio = studioResult.rows[0];
      
      // 생성자를 관리자로 추가
      await client.query(
        `INSERT INTO studio_members (studio_id, user_id, role) 
         VALUES ($1, $2, 'admin')`,
        [studio.id, req.user.id]
      );
      
      await client.query('COMMIT');
      res.status(201).json(studio);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create studio error:', error);
    res.status(500).json({ error: '스튜디오 생성 중 오류가 발생했습니다.' });
  }
});
// 스튜디오 상세 조회
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const studioResult = await db.query(
      'SELECT * FROM studios WHERE id = $1',
      [req.params.id]
    );
    
    if (studioResult.rows.length === 0) {
      return res.status(404).json({ error: '스튜디오를 찾을 수 없습니다.' });
    }
    
    // 멤버 확인
    const memberResult = await db.query(
      'SELECT * FROM studio_members WHERE studio_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    
    res.json(studioResult.rows[0]);
  } catch (error) {
    console.error('Get studio error:', error);
    res.status(500).json({ error: '스튜디오 정보를 가져올 수 없습니다.' });
  }
});

// 스튜디오 멤버 추가
router.post('/:id/members', authenticateToken, async (req, res) => {
  const { userId, role = 'member' } = req.body;
  
  try {
    // 권한 확인 (admin만 가능)
    const adminCheck = await db.query(
      'SELECT role FROM studio_members WHERE studio_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: '멤버 추가 권한이 없습니다.' });
    }
    
    const result = await db.query(
      `INSERT INTO studio_members (studio_id, user_id, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (studio_id, user_id) 
       DO UPDATE SET role = $3
       RETURNING *`,
      [req.params.id, userId, role]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: '멤버 추가 중 오류가 발생했습니다.' });
  }
});

export default router;