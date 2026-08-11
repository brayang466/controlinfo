-- Migración: empleados, turnos y horarios semanales
-- No destruye registros_diarios ni dias_calendario existentes.

USE control_paradas;

CREATE TABLE IF NOT EXISTS empleados (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  area VARCHAR(50) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_empleados_nombre_area (nombre, area)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS turnos_trabajo (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  hora_inicio VARCHAR(20) NOT NULL,
  hora_fin VARCHAR(20) NOT NULL,
  nota VARCHAR(100) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS horarios_semana (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  empleado_id INT NOT NULL,
  turno_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_semana_empleado_turno (fecha_inicio, empleado_id, turno_id),
  CONSTRAINT fk_hs_empleado
    FOREIGN KEY (empleado_id) REFERENCES empleados (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_hs_turno
    FOREIGN KEY (turno_id) REFERENCES turnos_trabajo (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX IF NOT EXISTS idx_horarios_semana_rango ON horarios_semana (fecha_inicio, fecha_fin);

INSERT IGNORE INTO empleados (nombre, area) VALUES
  ('Juan', 'Admin'),
  ('Juan', 'Planta'),
  ('Brayan', 'Admin'),
  ('Brayan', 'Planta'),
  ('Daniel', 'Admin'),
  ('Daniel', 'Planta');

INSERT INTO turnos_trabajo (nombre, hora_inicio, hora_fin, nota)
SELECT * FROM (
  SELECT 'Admin temprano' AS nombre, '7:00 AM' AS hora_inicio, '4:00 PM' AS hora_fin, NULL AS nota
  UNION ALL SELECT 'Admin estándar', '7:30 AM', '5:00 PM', NULL
  UNION ALL SELECT 'Admin extendido', '7:00 AM', '4:30 PM', NULL
  UNION ALL SELECT 'Planta tarde', '4:00 PM', 'F.P', NULL
  UNION ALL SELECT 'Planta festivo', '4:00 PM', 'F.P', 'Festivo'
  UNION ALL SELECT 'Planta con permiso', '4:00 PM', 'F.P', 'Permiso'
) t
WHERE NOT EXISTS (SELECT 1 FROM turnos_trabajo LIMIT 1);
