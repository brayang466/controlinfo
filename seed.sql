-- ============================================================
-- Datos de ejemplo — Enero 2026
-- Ejecutar después de schema.sql (o migrate_horarios.sql)
-- ============================================================

USE control_paradas;

-- Calendario completo de 2026
INSERT INTO dias_calendario (fecha, es_festivo, es_domingo, descripcion_festivo)
SELECT
  d.fecha,
  CASE WHEN d.fecha IN (
    '2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03',
    '2026-05-01','2026-05-18','2026-06-08','2026-06-15','2026-06-29',
    '2026-07-20','2026-08-07','2026-08-17','2026-10-12','2026-11-02',
    '2026-11-16','2026-12-08','2026-12-25'
  ) THEN TRUE ELSE FALSE END AS es_festivo,
  CASE WHEN DAYOFWEEK(d.fecha) = 1 THEN TRUE ELSE FALSE END AS es_domingo,
  CASE d.fecha
    WHEN '2026-01-01' THEN 'Año Nuevo'
    WHEN '2026-01-12' THEN 'Día de los Reyes Magos'
    ELSE NULL
  END AS descripcion_festivo
FROM (
  SELECT DATE_ADD('2026-01-01', INTERVAL seq DAY) AS fecha
  FROM (
    SELECT a.N + b.N * 10 + c.N * 100 AS seq
    FROM
      (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
       UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
      (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
       UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
      (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3) c
  ) numbers
  WHERE DATE_ADD('2026-01-01', INTERVAL seq DAY) <= '2026-12-31'
) d
WHERE NOT EXISTS (SELECT 1 FROM dias_calendario LIMIT 1);

INSERT INTO registros_diarios (
  fecha_id, minutos_parada, minutos_produccion,
  responsable_proceso, justificacion_parada
)
SELECT dc.id, r.minutos_parada, r.minutos_produccion,
       r.responsable_proceso, r.justificacion_parada
FROM (
  SELECT '2026-01-02' AS fecha, 0 AS minutos_parada, 444 AS minutos_produccion, 'BRAYAN' AS responsable_proceso, NULL AS justificacion_parada
  UNION ALL SELECT '2026-01-03', 0, 437, 'DANIEL', NULL
  UNION ALL SELECT '2026-01-05', 0, 700, 'BRAYAN', NULL
  UNION ALL SELECT '2026-01-06', 0, 700, 'DANIEL', NULL
  UNION ALL SELECT '2026-01-07', 0, 700, 'JUAN', NULL
  UNION ALL SELECT '2026-01-08', 0, 700, 'BRAYAN', NULL
  UNION ALL SELECT '2026-01-09', 0, 368, 'DANIEL', NULL
  UNION ALL SELECT '2026-01-10', 0, 437, 'JUAN', NULL
  UNION ALL SELECT '2026-01-13', 0, 778, 'JUAN', NULL
) r
JOIN dias_calendario dc ON dc.fecha = r.fecha
WHERE NOT EXISTS (
  SELECT 1 FROM registros_diarios rd WHERE rd.fecha_id = dc.id
);

-- Empleados / turnos (si aún no existen)
INSERT IGNORE INTO empleados (nombre) VALUES
  ('Juan'), ('Brayan'), ('Daniel');

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
