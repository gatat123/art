import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 이미지 업로드
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const { type, scene_id } = req.body;
    
    if (!scene_id || !type) {
      return res.status(400).json({ error: 'scene_id와 type이 필요합니다.' });
    }
    
    // 파일명 생성
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const filename = `${type}_${scene_id}_${timestamp}_${uniqueId}.webp`;
    const thumbnailFilename = `thumb_${filename}`;
    
    // Sharp로 이미지 처리
    const metadata = await sharp(req.file.buffer).metadata();
    
    // 원본 이미지 최적화
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 85 })
      .toBuffer();    
    // 썸네일 생성
    const thumbnailBuffer = await sharp(req.file.buffer)
      .resize(400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 70 })
      .toBuffer();
    
    // 파일 저장
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    const thumbnailPath = path.join(uploadsDir, thumbnailFilename);
    
    await fs.writeFile(filePath, optimizedBuffer);
    await fs.writeFile(thumbnailPath, thumbnailBuffer);
    
    // DB에 저장
    const result = await db.query(
      `INSERT INTO images (scene_id, type, file_path, thumbnail_path, file_size, width, height, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [scene_id, type, `/uploads/${filename}`, `/uploads/${thumbnailFilename}`, 
       optimizedBuffer.length, metadata.width, metadata.height, req.user.id]
    );
    
    // 활동 로그
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'upload_image', 'image', result.rows[0].id, 
       JSON.stringify({ type, scene_id })]
    );
    
    res.json({
      success: true,
      image: result.rows[0]
    });    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '이미지 업로드 중 오류가 발생했습니다.' });
  }
});

// 이미지 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // 이미지 정보 조회
    const imageResult = await db.query(
      'SELECT * FROM images WHERE id = $1',
      [req.params.id]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
    }
    
    const image = imageResult.rows[0];
    
    // 권한 확인 (업로더 또는 admin)
    if (image.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }
    
    // 파일 삭제
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filename = path.basename(image.file_path);
    const thumbnailFilename = path.basename(image.thumbnail_path);
    
    try {
      await fs.unlink(path.join(uploadsDir, filename));
      await fs.unlink(path.join(uploadsDir, thumbnailFilename));
    } catch (err) {
      console.error('File deletion error:', err);
    }
    
    // DB에서 삭제
    await db.query('DELETE FROM images WHERE id = $1', [req.params.id]);
    
    res.json({ success: true, message: '이미지가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: '이미지 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;