USE control_paradas;

UPDATE empleados e
JOIN (
  SELECT LOWER(nombre) AS nom, MIN(id) AS keep_id
  FROM empleados
  WHERE activo = TRUE
  GROUP BY LOWER(nombre)
  HAVING COUNT(*) > 1
) d ON LOWER(e.nombre) = d.nom AND e.id <> d.keep_id
SET e.activo = FALSE;

UPDATE empleados SET area = NULL;

INSERT INTO empleados (nombre, area, activo)
SELECT t.nombre, NULL, TRUE FROM (
  SELECT 'Juan' AS nombre UNION ALL SELECT 'Brayan' UNION ALL SELECT 'Daniel'
) t
WHERE NOT EXISTS (
  SELECT 1 FROM empleados e WHERE LOWER(e.nombre) = LOWER(t.nombre) AND e.activo = TRUE
);
