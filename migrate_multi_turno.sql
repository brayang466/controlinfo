-- Permite varios turnos distintos al mismo empleado en una semana
USE control_paradas;

ALTER TABLE horarios_semana DROP INDEX uk_semana_empleado;

ALTER TABLE horarios_semana
  ADD UNIQUE KEY uk_semana_empleado_turno (fecha_inicio, empleado_id, turno_id);
