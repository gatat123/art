import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 프로젝트 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  const { studio_id } = req.query;
  
  try {
    let query = `
      SELECT p.*, u.username as creator_name,
        COUNT(DISTINCT s.id) as scene_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN scenes s ON p.id = s.project_id
    `;
    
    const params = [];
    if (studio_id) {
      query += ' WHERE p.studio_id = $1';
      params.push(studio_id);
    }
    
    query += ' GROUP BY p.id, u.username ORDER BY p.created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: '프로젝트 목록을 가져올 수 없습니다.' });
  }
});

// 프로젝트 생성
router.post('/', authenticateToken, async (req, res) => {
  const { studio_id, title, description, deadline } = req.body;
  
  try {
    // 스튜디오 멤버 확인
    const memberCheck = await db.query(
      'SELECT * FROM studio_members WHERE studio_id = $1 AND user_id = $2',
      [studio_id, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: '해당 스튜디오의 멤버가 아닙니다.' });
    }
    
    const result = await db.query(
      `INSERT INTO projects (studio_id, title, description, deadline, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [studio_id, title, description, deadline, req.user.id]
    );
    
    // 활동 로그
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'create_project', 'project', result.rows[0].id, 
       JSON.stringify({ title })]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: '프로젝트 생성 중 오류가 발생했습니다.' });
  }
});
// 프로젝트 상세 조회
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, s.name as studio_name, u.username as creator_name
       FROM projects p
       LEFT JOIN studios s ON p.studio_id = s.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: '프로젝트 정보를 가져올 수 없습니다.' });
  }
});

// 프로젝트 수정
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, status, deadline } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE projects 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           deadline = COALESCE($4, deadline)
       WHERE id = $5
       RETURNING *`,
      [title, description, status, deadline, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: '프로젝트 수정 중 오류가 발생했습니다.' });
  }
});

export default router;