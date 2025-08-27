// 임시 파일 저장 (볼륨 없이)
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Railway 볼륨 또는 임시 디렉토리 사용
const UPLOAD_DIR = process.env.UPLOAD_DIR || (
  process.env.NODE_ENV === 'production' 
    ? '/app/uploads'  // Railway 볼륨 경로
    : path.join(process.cwd(), 'public', 'uploads')
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // 업로드 디렉토리 생성
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // 파일명 생성
    const fileExt = path.extname(file.name);
    const fileName = `${nanoid()}-${Date.now()}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL 생성
    const fileUrl = `/api/images/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}