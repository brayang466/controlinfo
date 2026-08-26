-- PIN independiente por usuario (migración incremental)
-- Ejecutar si ya tenías la tabla usuarios / pin_maestro

ALTER TABLE usuarios
  ADD COLUMN pin_hash VARCHAR(255) NULL,
  ADD COLUMN pin_asignado_en DATETIME NULL;

-- Si alguna columna ya existía, ignora el error de "Duplicate column".

-- Opcional: eliminar PIN compartido antiguo
-- DROP TABLE IF EXISTS pin_maestro;
