import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 씬 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  const { project_id } = req.query;
  
  if (!project_id) {
    return res.status(400).json({ error: 'project_id가 필요합니다.' });
  }
  
  try {
    const result = await db.query(
      `SELECT s.*, 
        COUNT(DISTINCT i.id) as image_count,
        COUNT(DISTINCT c.id) as comment_count
       FROM scenes s
       LEFT JOIN images i ON s.id = i.scene_id
       LEFT JOIN comments c ON s.id = c.scene_id
       WHERE s.project_id = $1
       GROUP BY s.id
       ORDER BY s.scene_number`,
      [project_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get scenes error:', error);
    res.status(500).json({ error: '씬 목록을 가져올 수 없습니다.' });
  }
});

// 씬 생성
router.post('/', authenticateToken, async (req, res) => {
  const { project_id, scene_number, title, description, dialogue, action_description } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO scenes (project_id, scene_number, title, description, dialogue, action_description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [project_id, scene_number, title, description, dialogue, action_description]
    );
    
    // 활동 로그
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'create_scene', 'scene', result.rows[0].id, 
       JSON.stringify({ scene_number, title })]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: '해당 씬 번호가 이미 존재합니다.' });
    }
    console.error('Create scene error:', error);
    res.status(500).json({ error: '씬 생성 중 오류가 발생했습니다.' });
  }
});
// 씬 상세 조회
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sceneResult = await db.query(
      'SELECT * FROM scenes WHERE id = $1',
      [req.params.id]
    );
    
    if (sceneResult.rows.length === 0) {
      return res.status(404).json({ error: '씬을 찾을 수 없습니다.' });
    }
    
    // 이미지 조회
    const imagesResult = await db.query(
      `SELECT i.*, u.username as uploader_name
       FROM images i
       LEFT JOIN users u ON i.uploaded_by = u.id
       WHERE i.scene_id = $1
       ORDER BY i.uploaded_at DESC`,
      [req.params.id]
    );
    
    // 댓글 조회
    const commentsResult = await db.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.scene_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );
    
    res.json({
      ...sceneResult.rows[0],
      images: imagesResult.rows,
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error('Get scene error:', error);
    res.status(500).json({ error: '씬 정보를 가져올 수 없습니다.' });
  }
});
// 씬 수정
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, dialogue, action_description, status } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE scenes 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           dialogue = COALESCE($3, dialogue),
           action_description = COALESCE($4, action_description),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [title, description, dialogue, action_description, status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '씬을 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update scene error:', error);
    res.status(500).json({ error: '씬 수정 중 오류가 발생했습니다.' });
  }
});

export default router;