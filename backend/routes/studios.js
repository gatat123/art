import express from 'express';
import crypto from 'crypto';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 초대코드 생성 함수
function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

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
      
      // 기본 초대코드 생성
      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료
      
      await client.query(
        `INSERT INTO invite_codes (studio_id, code, created_by, expires_at) 
         VALUES ($1, $2, $3, $4)`,
        [studio.id, inviteCode, req.user.id, expiresAt]
      );
      
      await client.query('COMMIT');
      res.status(201).json({ ...studio, invite_code: inviteCode });
      
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

// 초대코드 생성
router.post('/:id/invite-code', authenticateToken, async (req, res) => {
  const { maxUses, expiresIn = 7 } = req.body; // expiresIn: 만료 일수
  
  try {
    // 권한 확인 (admin만 가능)
    const adminCheck = await db.query(
      'SELECT role FROM studio_members WHERE studio_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: '초대코드 생성 권한이 없습니다.' });
    }
    
    // 기존 활성 초대코드 비활성화
    await db.query(
      'UPDATE invite_codes SET is_active = false WHERE studio_id = $1 AND is_active = true',
      [req.params.id]
    );
    
    // 새 초대코드 생성
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);
    
    const result = await db.query(
      `INSERT INTO invite_codes (studio_id, code, created_by, expires_at, max_uses) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, code, req.user.id, expiresAt, maxUses]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create invite code error:', error);
    res.status(500).json({ error: '초대코드 생성 중 오류가 발생했습니다.' });
  }
});

// 현재 활성 초대코드 조회
router.get('/:id/invite-code', authenticateToken, async (req, res) => {
  try {
    // 멤버 확인
    const memberCheck = await db.query(
      'SELECT role FROM studio_members WHERE studio_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    
    const result = await db.query(
      `SELECT * FROM invite_codes 
       WHERE studio_id = $1 AND is_active = true 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC LIMIT 1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '활성 초대코드가 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get invite code error:', error);
    res.status(500).json({ error: '초대코드 조회 중 오류가 발생했습니다.' });
  }
});

// 초대코드로 스튜디오 참가
router.post('/join', authenticateToken, async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: '초대코드가 필요합니다.' });
  }
  
  try {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 초대코드 확인
      const inviteResult = await client.query(
        `SELECT ic.*, s.name as studio_name 
         FROM invite_codes ic
         JOIN studios s ON ic.studio_id = s.id
         WHERE ic.code = $1 AND ic.is_active = true
         AND (ic.expires_at IS NULL OR ic.expires_at > CURRENT_TIMESTAMP)
         AND (ic.max_uses IS NULL OR ic.used_count < ic.max_uses)`,
        [code.toUpperCase()]
      );
      
      if (inviteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: '유효하지 않은 초대코드입니다.' });
      }
      
      const invite = inviteResult.rows[0];
      
      // 이미 멤버인지 확인
      const memberCheck = await client.query(
        'SELECT * FROM studio_members WHERE studio_id = $1 AND user_id = $2',
        [invite.studio_id, req.user.id]
      );
      
      if (memberCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: '이미 해당 스튜디오의 멤버입니다.' });
      }
      
      // 스튜디오 멤버로 추가
      await client.query(
        `INSERT INTO studio_members (studio_id, user_id, role) 
         VALUES ($1, $2, 'member')`,
        [invite.studio_id, req.user.id]
      );
      
      // 초대코드 사용 횟수 증가
      await client.query(
        'UPDATE invite_codes SET used_count = used_count + 1 WHERE id = $1',
        [invite.id]
      );
      
      // 초대코드 사용 기록
      await client.query(
        'INSERT INTO invite_code_uses (invite_code_id, used_by) VALUES ($1, $2)',
        [invite.id, req.user.id]
      );
      
      // 활동 로그
      await client.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) 
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, 'join_studio', 'studio', invite.studio_id, 
         JSON.stringify({ invite_code: code, studio_name: invite.studio_name })]
      );
      
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        studio_id: invite.studio_id,
        studio_name: invite.studio_name,
        message: '스튜디오에 성공적으로 참가했습니다.' 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Join studio error:', error);
    res.status(500).json({ error: '스튜디오 참가 중 오류가 발생했습니다.' });
  }
});

export default router;
