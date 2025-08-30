import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 업로드 디렉토리 생성
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');

async function ensureDirectories() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }
}

ensureDirectories();

// Multer 설정 - 메모리 저장
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 이미지 업로드 엔드포인트
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const { type, projectId, sceneId } = req.body;
    
    // 고유한 파일명 생성
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname);
    const filename = `${type}_${projectId}_${sceneId}_${timestamp}_${uniqueId}${ext}`;
    
    // Sharp를 사용하여 이미지 최적화
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    
    // 썸네일 생성
    const thumbnailBuffer = await sharp(req.file.buffer)
      .resize(400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 70 })
      .toBuffer();
    
    // 파일 저장
    const filePath = path.join(uploadsDir, filename);
    const thumbnailPath = path.join(uploadsDir, `thumb_${filename}`);
    
    await fs.writeFile(filePath, optimizedBuffer);
    await fs.writeFile(thumbnailPath, thumbnailBuffer);
    
    // URL 반환
    const fileUrl = `/uploads/${filename}`;
    const thumbnailUrl = `/uploads/thumb_${filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      thumbnailUrl: thumbnailUrl,
      filename: filename,
      size: optimizedBuffer.length,
      originalSize: req.file.buffer.length
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

// Static 파일 제공
app.use('/uploads', express.static(uploadsDir));

// 이미지 삭제 엔드포인트
app.delete('/api/upload/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    const thumbnailPath = path.join(uploadsDir, `thumb_${filename}`);
    
    await fs.unlink(filePath);
    await fs.unlink(thumbnailPath).catch(() => {}); // 썸네일은 없을 수도 있음
    
    res.json({ success: true, message: '파일이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
  }
});

// 디스크 사용량 체크 (Railway 5달러 플랜은 약 10GB 스토리지)
app.get('/api/storage-info', async (req, res) => {
  try {
    const files = await fs.readdir(uploadsDir);
    let totalSize = 0;
    
    for (const file of files) {
      const stats = await fs.stat(path.join(uploadsDir, file));
      totalSize += stats.size;
    }
    
    res.json({
      totalFiles: files.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxSizeMB: 8000, // 8GB로 안전하게 설정 (Railway 5달러 플랜)
      usagePercent: ((totalSize / (8000 * 1024 * 1024)) * 100).toFixed(2)
    });
  } catch (error) {
    console.error('Storage info error:', error);
    res.status(500).json({ error: '스토리지 정보를 가져올 수 없습니다.' });
  }
});

// 오래된 파일 정리 (30일 이상된 파일)
app.post('/api/cleanup', async (req, res) => {
  try {
    const files = await fs.readdir(uploadsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `${deletedCount}개의 오래된 파일이 삭제되었습니다.` 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: '정리 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
});
