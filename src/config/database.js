// Railway 배포 시 환경 변수 확인용

const config = {
  database: {
    url: process.env.DATABASE_URL || 'sqlite://dev.db',
    // Railway PostgreSQL URL 형식:
    // postgresql://postgres:password@host.railway.internal:5432/railway
  },
  app: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'development-secret',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'development-nextauth-secret',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './public/uploads',
  }
};

console.log('Database URL configured:', config.database.url ? 'Yes' : 'No');
console.log('Environment:', process.env.NODE_ENV);

export default config;