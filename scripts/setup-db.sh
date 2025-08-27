#!/bin/bash
# Railway 배포 시 자동으로 실행되는 스크립트

echo "Starting database setup..."

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate deploy

echo "Database setup complete!"