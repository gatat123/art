import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './websocket/socketHandlers.js';

// Routes
import authRouter from './routes/auth.js';
import studiosRouter from './routes/studios.js';
import projectsRouter from './routes/projects.js';
import scenesRouter from './routes/scenes.js';
import imagesRouter from './routes/images.js';
import commentsRouter from './routes/comments.js';
import usersRouter from './routes/users.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Socket.io 서버 설정
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://art-production-a9ab.up.railway.app',
    credentials: true
  }
});

// WebSocket 핸들러 설정
setupSocketHandlers(io);

// 업로드 디렉토리 생성
const uploadsDir = path.join(__dirname, 'uploads');
async function ensureDirectories() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('📁 Uploads directory created');
  }
}
ensureDirectories();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 요청 제한
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://art-production-a9ab.up.railway.app',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(uploadsDir));

// Socket.io를 req에 추가하여 라우트에서 사용 가능하게 함
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/studios', studiosRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/images', imagesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Studio Backend Running',
    timestamp: new Date().toISOString(),
    websocket: 'enabled'
  });
});

// Storage info
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
      maxSizeMB: 8000,
      usagePercent: ((totalSize / (8000 * 1024 * 1024)) * 100).toFixed(2)
    });
  } catch (error) {
    console.error('Storage info error:', error);
    res.status(500).json({ error: '스토리지 정보를 가져올 수 없습니다.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || '서버 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// HTTP 서버 시작 (Socket.io와 함께)
httpServer.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket enabled`);
});
