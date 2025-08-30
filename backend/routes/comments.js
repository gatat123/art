import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 씬별 댓글 조회
router.get('/', authenticateToken, async (req, res) => {
  const { scene_id } = req.query;
  
  if (!scene_id) {
    return res.status(400).json({ error: 'scene_id가 필요합니다.' });
  }
  
  try {
    const result = await db.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.scene_id = $1
       ORDER BY c.created_at DESC`,
      [scene_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: '댓글 조회 중 오류가 발생했습니다.' });
  }
});

// 댓글 생성
router.post('/', authenticateToken, async (req, res) => {
  const { scene_id, content, parent_id, annotation_data, image_type, tag } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO comments (scene_id, user_id, content, parent_id, annotation_data, image_type, tag, resolved) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [scene_id, req.user.id, content, parent_id, annotation_data, image_type, tag, false]
    );
    
    // 사용자 정보 조인
    const commentWithUser = await db.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );
    
    // 활동 로그 기록
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'create_comment', 'comment', result.rows[0].id, 
       JSON.stringify({ scene_id, tag, has_annotation: !!annotation_data })]
    );
    
    res.status(201).json(commentWithUser.rows[0]);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: '댓글 작성 중 오류가 발생했습니다.' });
  }
});

// 댓글 수정
router.put('/:id', authenticateToken, async (req, res) => {
  const { content, resolved, tag } = req.body;
  
  try {
    let query = 'UPDATE comments SET ';
    const values = [];
    const updates = [];
    
    if (content !== undefined) {
      updates.push(`content = $${values.length + 1}`);
      values.push(content);
    }
    
    if (resolved !== undefined) {
      updates.push(`resolved = $${values.length + 1}`);
      values.push(resolved);
    }
    
    if (tag !== undefined) {
      updates.push(`tag = $${values.length + 1}`);
      values.push(tag);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '수정할 내용이 없습니다.' });
    }
    
    query += updates.join(', ');
    query += ` WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`;
    values.push(req.params.id, req.user.id);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '댓글을 찾을 수 없거나 수정 권한이 없습니다.' });
    }
    
    // 사용자 정보 조인하여 반환
    const commentWithUser = await db.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );
    
    res.json(commentWithUser.rows[0]);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: '댓글 수정 중 오류가 발생했습니다.' });
  }
});

// 댓글 해결 상태 토글
router.patch('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    // 먼저 현재 상태 확인
    const currentState = await db.query(
      'SELECT resolved FROM comments WHERE id = $1',
      [req.params.id]
    );
    
    if (currentState.rows.length === 0) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    
    const newResolvedState = !currentState.rows[0].resolved;
    
    const result = await db.query(
      `UPDATE comments 
       SET resolved = $1
       WHERE id = $2
       RETURNING *`,
      [newResolvedState, req.params.id]
    );
    
    // 사용자 정보 조인하여 반환
    const commentWithUser = await db.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );
    
    res.json(commentWithUser.rows[0]);
  } catch (error) {
    console.error('Toggle resolve error:', error);
    res.status(500).json({ error: '댓글 상태 변경 중 오류가 발생했습니다.' });
  }
});

// 댓글 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.' });
    }
    
    res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: '댓글 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
