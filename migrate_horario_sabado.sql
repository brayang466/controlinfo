-- Horario aparte para sábado dentro de la misma semana
USE control_paradas;

ALTER TABLE horarios_semana
  ADD COLUMN IF NOT EXISTS ambito VARCHAR(20) NOT NULL DEFAULT 'lun_vie'
    COMMENT 'lun_vie | sabado' AFTER fecha_fin;

-- Recrear único incluyendo ambito
ALTER TABLE horarios_semana DROP INDEX uk_semana_empleado_turno;
ALTER TABLE horarios_semana
  ADD UNIQUE KEY uk_semana_emp_turno_ambito (fecha_inicio, empleado_id, turno_id, ambito);

UPDATE horarios_semana SET ambito = 'lun_vie' WHERE ambito IS NULL OR ambito = '';
