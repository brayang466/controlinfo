-- ============================================================
-- PARADAS DE LÍNEA POR TECNOLOGÍA 2026
-- Schema MySQL / MariaDB — MySQL Workbench 8.0+
-- ============================================================

DROP DATABASE IF EXISTS control_paradas;
CREATE DATABASE control_paradas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE control_paradas;

CREATE TABLE dias_calendario (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  es_festivo BOOLEAN NOT NULL DEFAULT FALSE,
  es_domingo BOOLEAN NOT NULL DEFAULT FALSE,
  descripcion_festivo VARCHAR(100) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_dias_calendario_fecha (fecha)
) ENGINE=InnoDB;

CREATE TABLE registros_diarios (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_id INT NOT NULL,
  minutos_parada INT NOT NULL DEFAULT 0,
  minutos_produccion INT NOT NULL DEFAULT 0,
  hora_inicio_proceso VARCHAR(8) NULL COMMENT 'HH:MM:SS inicio de proceso',
  hora_fin_proceso VARCHAR(8) NULL COMMENT 'HH:MM:SS fin de proceso',
  porcentaje_parada DECIMAL(5,2)
    GENERATED ALWAYS AS (
      CASE
        WHEN (minutos_parada + minutos_produccion) = 0 THEN 0
        ELSE ROUND(
          (minutos_parada / (minutos_parada + minutos_produccion)) * 100,
          2
        )
      END
    ) STORED,
  responsable_proceso VARCHAR(100) NULL,
  justificacion_parada TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_registros_diarios_fecha (fecha_id),
  CONSTRAINT fk_registros_fecha
    FOREIGN KEY (fecha_id) REFERENCES dias_calendario (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Catálogo de empleados (solo nombre; el turno se asigna por semana)
CREATE TABLE empleados (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  area VARCHAR(50) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_empleados_nombre (nombre)
) ENGINE=InnoDB;

-- Catálogo de turnos / horarios de trabajo (editable)
CREATE TABLE turnos_trabajo (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  hora_inicio VARCHAR(20) NOT NULL,
  hora_fin VARCHAR(20) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Asignación semanal: lun–vie y sábado por separado
CREATE TABLE horarios_semana (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_inicio DATE NOT NULL COMMENT 'Lunes de la semana',
  fecha_fin DATE NOT NULL COMMENT 'Domingo de la semana',
  ambito VARCHAR(20) NOT NULL DEFAULT 'lun_vie' COMMENT 'lun_vie | sabado',
  empleado_id INT NOT NULL,
  turno_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_semana_emp_turno_ambito (fecha_inicio, empleado_id, turno_id, ambito),
  CONSTRAINT fk_hs_empleado
    FOREIGN KEY (empleado_id) REFERENCES empleados (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_hs_turno
    FOREIGN KEY (turno_id) REFERENCES turnos_trabajo (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Excepciones / cambios de horario entre compañeros (por día)
CREATE TABLE horarios_excepciones (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_inicio DATE NOT NULL COMMENT 'Lunes de la semana',
  fecha DATE NOT NULL COMMENT 'Día del cambio',
  empleado_cubre_id INT NOT NULL COMMENT 'Quién cubre / queda en el turno',
  empleado_sale_id INT NULL COMMENT 'Quién cede / salía del turno',
  turno_id INT NOT NULL,
  nota VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_hex_semana (fecha_inicio),
  KEY idx_hex_fecha (fecha),
  CONSTRAINT fk_hex_cubre
    FOREIGN KEY (empleado_cubre_id) REFERENCES empleados (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_hex_sale
    FOREIGN KEY (empleado_sale_id) REFERENCES empleados (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_hex_turno
    FOREIGN KEY (turno_id) REFERENCES turnos_trabajo (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Texto consolidado por día (compatibilidad / export)
CREATE TABLE horarios_personal (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_id INT NOT NULL,
  detalle_horario TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_horarios_fecha (fecha_id),
  CONSTRAINT fk_horarios_fecha
    FOREIGN KEY (fecha_id) REFERENCES dias_calendario (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  rol VARCHAR(20) NOT NULL COMMENT 'superadmin | admin | visitante',
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  pin_hash VARCHAR(255) NULL,
  pin_asignado_en DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_username (username)
) ENGINE=InnoDB;

INSERT INTO usuarios (username, rol, nombre, activo) VALUES
  ('superadmin', 'superadmin', 'Super Administrador', TRUE),
  ('admin', 'admin', 'Administrador', TRUE),
  ('visitante', 'visitante', 'Visitante', TRUE);

CREATE INDEX idx_dias_calendario_fecha ON dias_calendario (fecha);
CREATE INDEX idx_horarios_semana_rango ON horarios_semana (fecha_inicio, fecha_fin);

-- Datos iniciales
INSERT INTO empleados (nombre) VALUES
  ('Juan'),
  ('Brayan'),
  ('Daniel');

INSERT INTO turnos_trabajo (nombre, hora_inicio, hora_fin) VALUES
  ('Admin temprano', '7:00 AM', '4:00 PM'),
  ('Admin estándar', '7:30 AM', '5:00 PM'),
  ('Admin extendido', '7:00 AM', '4:30 PM'),
  ('Planta tarde', '4:00 PM', 'F.P'),
  ('Planta festivo', '4:00 PM', 'F.P'),
  ('Planta con permiso', '4:00 PM', 'F.P');
