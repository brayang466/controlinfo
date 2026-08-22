-- ============================================================
-- Auth: usuarios + PIN maestro (una sola asignación)
-- Base: control_paradas
-- Ejecutar en MySQL/MariaDB (Workbench o mysql CLI)
-- ============================================================

-- 1) Tabla de usuarios (sin contraseña: se elige usuario y se valida PIN)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  rol VARCHAR(20) NOT NULL COMMENT 'superadmin | admin | visitante',
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Si ya tenías password_hash obligatorio, hazlo opcional (ignora error si no existe):
-- ALTER TABLE usuarios MODIFY password_hash VARCHAR(255) NULL;

-- 2) PIN maestro (máximo 1 fila; si existe = ya asignado)
CREATE TABLE IF NOT EXISTS pin_maestro (
  id TINYINT NOT NULL PRIMARY KEY,
  pin_hash VARCHAR(255) NOT NULL,
  asignado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Los 3 usuarios del login
INSERT INTO usuarios (username, rol, nombre, activo)
VALUES
  ('superadmin', 'superadmin', 'Super Administrador', TRUE),
  ('admin', 'admin', 'Administrador', TRUE),
  ('visitante', 'visitante', 'Visitante', TRUE)
ON DUPLICATE KEY UPDATE
  rol = VALUES(rol),
  nombre = VALUES(nombre),
  activo = VALUES(activo);

-- Verificar:
-- SELECT id, username, rol, nombre, activo FROM usuarios;
-- SELECT id, asignado_en FROM pin_maestro;
