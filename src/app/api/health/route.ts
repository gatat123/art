// DB 연결 테스트 API (App Router)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // DB 연결 테스트
    await prisma.$connect();
    
    // 간단한 쿼리 실행
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'connected',
      message: 'Database connection successful',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
