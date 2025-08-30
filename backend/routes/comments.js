import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 댓글 생성
router.post('/', authenticateToken, async (req, res) => {
  const { scene_id, content, parent_id } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO comments (scene_id, user_id, content, parent_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [scene_id, req.user.id, content, parent_id]
    );
    
    // 사용자 정보 조인
    const commentWithUser = await db.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );
    
    res.status(201).json(commentWithUser.rows[0]);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: '댓글 작성 중 오류가 발생했습니다.' });
  }
});
// 댓글 수정
router.put('/:id', authenticateToken, async (req, res) => {
  const { content } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE comments 
       SET content = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [content, req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '댓글을 찾을 수 없거나 수정 권한이 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: '댓글 수정 중 오류가 발생했습니다.' });
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