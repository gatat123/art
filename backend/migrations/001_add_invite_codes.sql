-- 초대코드 테이블 추가
CREATE TABLE IF NOT EXISTS invite_codes (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER REFERENCES studios(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 초대코드 사용 기록 테이블
CREATE TABLE IF NOT EXISTS invite_code_uses (
  id SERIAL PRIMARY KEY,
  invite_code_id INTEGER REFERENCES invite_codes(id) ON DELETE CASCADE,
  used_by INTEGER REFERENCES users(id),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가
CREATE INDEX idx_invite_codes_studio ON invite_codes(studio_id);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_code_uses_code ON invite_code_uses(invite_code_id);
CREATE INDEX idx_invite_code_uses_user ON invite_code_uses(used_by);

-- 트리거 추가
CREATE TRIGGER update_invite_codes_updated_at BEFORE UPDATE ON invite_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
