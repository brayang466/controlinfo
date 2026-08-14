-- Amplía horas de proceso para permitir HH:MM:SS
ALTER TABLE registros_diarios
  MODIFY COLUMN hora_inicio_proceso VARCHAR(8) NULL COMMENT 'HH:MM:SS inicio de proceso',
  MODIFY COLUMN hora_fin_proceso VARCHAR(8) NULL COMMENT 'HH:MM:SS fin de proceso';
