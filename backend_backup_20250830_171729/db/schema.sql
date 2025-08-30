-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 스튜디오 테이블
CREATE TABLE IF NOT EXISTS studios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  invite_code VARCHAR(20) UNIQUE,
  invite_code_expires_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 스튜디오 멤버 테이블
CREATE TABLE IF NOT EXISTS studio_members (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER REFERENCES studios(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- admin, editor, viewer
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(studio_id, user_id)
);

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER REFERENCES studios(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, review, completed
  thumbnail_url VARCHAR(500),
  deadline DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 씬 테이블
CREATE TABLE IF NOT EXISTS scenes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  title VARCHAR(200),
  description TEXT,
  narration TEXT,
  sound TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, artwork, review, approved
  has_revision_request BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, scene_number)
);

-- 이미지 테이블
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- draft, artwork, reference, annotation
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'normal', -- normal, revision_request, resolved
  has_annotation BOOLEAN DEFAULT FALSE,
  annotation_data TEXT,
  image_type VARCHAR(50), -- draft, artwork
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- project, scene, image, comment
  entity_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_projects_studio ON projects(studio_id);
CREATE INDEX idx_scenes_project ON scenes(project_id);
CREATE INDEX idx_images_scene ON images(scene_id);
CREATE INDEX idx_comments_scene ON comments(scene_id);
CREATE INDEX idx_studio_members ON studio_members(studio_id, user_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_studios_invite_code ON studios(invite_code);
CREATE INDEX idx_scenes_revision ON scenes(has_revision_request);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON studios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
