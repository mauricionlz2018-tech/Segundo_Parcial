CREATE TABLE IF NOT EXISTS sesion_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sesion_id TEXT NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sesion_id)
);

CREATE INDEX IF NOT EXISTS idx_sesion_likes_sesion ON sesion_likes(sesion_id);
CREATE INDEX IF NOT EXISTS idx_sesion_likes_user ON sesion_likes(user_id);
