import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : path.join(process.cwd(), 'public', 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filePath = path.join(UPLOAD_DIR, params.filename);

    if (!existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 });
    }

    const file = await readFile(filePath);
    
    // 파일 확장자로 MIME 타입 결정
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000'
      }
    });

  } catch (error) {
    console.error('Image serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}