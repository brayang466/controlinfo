-- Agrega horas de inicio/fin de proceso para calcular minutos de producción
USE control_paradas;

ALTER TABLE registros_diarios
  ADD COLUMN IF NOT EXISTS hora_inicio_proceso VARCHAR(5) NULL AFTER minutos_produccion,
  ADD COLUMN IF NOT EXISTS hora_fin_proceso VARCHAR(5) NULL AFTER hora_inicio_proceso;
