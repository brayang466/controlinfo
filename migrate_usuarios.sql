-- ============================================================
-- Auth: usuarios + PIN independiente por usuario (admin/superadmin)
-- Base: control_paradas
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  rol VARCHAR(20) NOT NULL COMMENT 'superadmin | admin | visitante',
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  pin_hash VARCHAR(255) NULL,
  pin_asignado_en DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO usuarios (username, rol, nombre, activo)
VALUES
  ('superadmin', 'superadmin', 'Super Administrador', TRUE),
  ('admin', 'admin', 'Administrador', TRUE),
  ('visitante', 'visitante', 'Visitante', TRUE)
ON DUPLICATE KEY UPDATE
  rol = VALUES(rol),
  nombre = VALUES(nombre),
  activo = VALUES(activo);

-- Si la tabla ya existía, agrega columnas de PIN (ignora error Duplicate column):
-- ALTER TABLE usuarios ADD COLUMN pin_hash VARCHAR(255) NULL;
-- ALTER TABLE usuarios ADD COLUMN pin_asignado_en DATETIME NULL;

-- Opcional: deja de usarse el PIN compartido anterior
-- DROP TABLE IF EXISTS pin_maestro;

-- Restablecer PIN de un usuario:
-- UPDATE usuarios SET pin_hash = NULL, pin_asignado_en = NULL WHERE username = 'admin';
-- UPDATE usuarios SET pin_hash = NULL, pin_asignado_en = NULL WHERE username = 'superadmin';
