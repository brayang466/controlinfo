-- Portal Siimed: anulación / eliminación de documentos (registro mensual)
-- Base: control_paradas

CREATE TABLE IF NOT EXISTS siimed_documentos (
  id INT NOT NULL AUTO_INCREMENT,
  anio SMALLINT NOT NULL,
  mes TINYINT NOT NULL COMMENT '1-12',
  departamento VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(120) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  numero_documento VARCHAR(120) NOT NULL,
  accion VARCHAR(80) NOT NULL COMMENT 'Anulación | Eliminación | etc.',
  motivo VARCHAR(500) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_siimed_periodo (anio, mes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
