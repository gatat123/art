-- 댓글 테이블에 누락된 필드 추가
ALTER TABLE comments ADD COLUMN IF NOT EXISTS annotation_data TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS image_type VARCHAR(50);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS tag VARCHAR(50);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_comments_tag ON comments(tag);
CREATE INDEX IF NOT EXISTS idx_comments_resolved ON comments(resolved);
