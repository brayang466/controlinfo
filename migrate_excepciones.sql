-- Excepciones de horario (cambios entre compañeros por día)
CREATE TABLE IF NOT EXISTS horarios_excepciones (
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
