-- ============================================================
-- Carga inicial Siimed 2026 (registros históricos del Excel)
-- Requiere tabla siimed_documentos (migrate_siimed.sql)
-- Año usado: 2026
-- Idempotente: no duplica si ya existen mismos datos clave
-- ============================================================

CREATE TABLE IF NOT EXISTS siimed_documentos (
  id INT NOT NULL AUTO_INCREMENT,
  anio SMALLINT NOT NULL,
  mes TINYINT NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(120) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  numero_documento VARCHAR(120) NOT NULL,
  accion VARCHAR(80) NOT NULL,
  motivo VARCHAR(500) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_siimed_periodo (anio, mes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ejecutar UNA sola vez. Si necesitas reimportar (borra solo el lote 2026 ene–ago):
-- DELETE FROM siimed_documentos WHERE anio = 2026 AND mes BETWEEN 1 AND 8;

INSERT INTO siimed_documentos
  (anio, mes, departamento, area, tipo_documento, cantidad, numero_documento, accion, motivo)
VALUES
-- ENERO
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L1', 1, '45995', 'Eliminación', 'ERROR EN DATOS'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L1', 4, '700-701-702-703', 'Eliminación', 'RENOVACION DOCUMENTOS'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'H7', 1, '632', 'Eliminación', 'RENOVACION DOCUMENTOS'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Compras', 'Y1', 1, '28868 a la 28878', 'Eliminación', NULL),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'U2', 5, '11-13, 142, 153', 'Eliminación', 'NO APLICA'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L1', 1, '46080', 'Eliminación', 'NO APLICA'),
(2026, 1, 'PRODUCCION', 'Logistica', 'H1', 2, '631 - 635', 'Eliminación', 'DUPLICIDAD'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Almacen', 'H1', 1, '13809', 'Anulación', 'ERROR EN DATOS'),
(2026, 1, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L15', 1, '1345', 'Eliminación', 'PENDIENTE EN INCLUIR EN LA LIQUIDACION LAS CESANTIAS E INTERESES DE CESANTIAS 2025'),
(2026, 1, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L11', 2, '73748-73749', 'Eliminación', 'ERROR EN DATOS AL CONTABILIZAR'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Tesoreria', 'G3', 1, '24347', 'Anulación', 'ERROR AL CONTABILIZAR LOS PAGOS'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L1', 1, '46075', 'Eliminación', 'NO SE DEBÍA UTILIZAR ESE TIPO DE DOCUMENTO'),
(2026, 1, 'COMERCIAL', 'Comercial', 'E3', 1, '99', 'Anulación', 'CAMBIO DE TERCERO PARA LA NEGOCIACIÓN DE COMPRA'),
(2026, 1, 'ADMINISTRACION Y FINANZAS', 'Cartera', 'F2', 1, '47700', 'Eliminación', 'SE COBRARON 11 TRANSPORTES INCLUYENDO LA RETENCIÓN EN LA FUENTE DEL 1% PERO AL VISUALIZAR LA FACTURA NO ESTÁ MOSTRANDO EL DESCUENTO'),

-- FEBRERO
(2026, 2, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L17', 1, '81356', 'Eliminación', 'EL DESEMBOLSO LO DEBE REALIZAR TESORERIA POR EL DESCUENTO QUE SE REALIZO DE RETENCION DE DICIEMBRE'),
(2026, 2, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L11', 2, '74042-74045', 'Eliminación', 'ERROR EN DATOS AL CONTABILIZAR'),
(2026, 2, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L17', 1, '81889', 'Eliminación', 'EL DESEMBOLSO LO DEBE REALIZAR TESORERIA POR EL DESCUENTO QUE SE REALIZO DE RETENCION DE DICIEMBRE'),
(2026, 2, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L14', 4, '700 A LA 703', 'Eliminación', 'CAMBIO DE TERCEROS PARA LA PROVISION DE PARAFISCALES DE NOMINA.'),
(2026, 2, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L9', 300, '1 - 299', 'Eliminación', 'ERROR HUMANO'),
(2026, 2, 'ADMINISTRACION Y FINANZAS', 'Tesoreria', 'G3', 1, '24548', 'Anulación', 'NO SE REALIZO EL PAGO EL DIA QUE SE HIZO EL FORMATO'),
(2026, 2, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L9', 1, '300', 'Eliminación', 'PRUEBA PARA REGISTRAR INCAPACIDADES'),
(2026, 2, 'COMERCIAL', 'Comercial', 'E3', 3, '111 - 113', 'Eliminación', 'DEBIDO QUE SE CRUZO EL CONSECUTIVO FALTANDO UNA E3'),

-- MARZO
(2026, 3, 'COMERCIAL', 'Comercial', 'E3', 3, '136', 'Anulación', 'DEBIDO QUE SE CRUZO EL CONSECUTIVO Y-18 COMPRA GANADO MZ-COLBEEF'),

-- ABRIL
(2026, 4, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L11', 2, 'L11 - 76248, L11 - 76105', 'Eliminación', 'ASOCIACIÓN CONTABLE DEL CONCEPTO REINTEGRO POR PAGAR NÓMINA ES INCORRECTA'),
(2026, 4, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L14', 4, 'L14-713, L14-714, L14-715 y L14-716.', 'Eliminación', 'NO SE MENCIONO EL MOTIVO CLARO POR PARTE DEL USUARIO SOLICITANTE'),
(2026, 4, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L1', 1, 'L1-46613', 'Eliminación', 'NO SE MENCIONO EL MOTIVO CLARO POR PARTE DEL USUARIO SOLICITANTE'),
(2026, 4, 'ADMINISTRACION Y FINANZAS', 'Cartera', 'J3', 1, 'J3-5779', 'Eliminación', 'DEVOLUCIÓN ERRONEA ERROR HUMANO'),
(2026, 4, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L11, L12', 2, 'L11 - 76491, L12 - 15829', 'Eliminación', 'DOCUMENTOS HECHOS COMO PRUEBAS'),
(2026, 4, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L15', 1, 'L15 - 1393', 'Eliminación', 'DOCUMENTO QUEDO MAL REALIZADO'),

-- MAYO
(2026, 5, 'JURIDICA Y GESTION HUMANA', 'Nomina', 'L17', 200, '84258 al 84458', 'Eliminación', 'SE CONTABILIZO MAL, ERROR DE GOOGLE CHROME'),

-- JUNIO
(2026, 6, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L14', 4, '729-732', 'Eliminación', NULL),
(2026, 6, 'ADMINISTRACION Y FINANZAS', 'Cartera', 'F2', 1, '50721', 'Eliminación', NULL),
(2026, 6, 'ADMINISTRACION Y FINANZAS', 'Cartera', 'G3', 4, '25159, 25160, 25161, 25162', 'Anulación', 'FECHA ERRONEA'),
(2026, 6, 'ADMINISTRACION Y FINANZAS', 'Cartera', 'G3', 1, '25305', 'Anulación', 'ERROR HUMANO AL DIGITAR EL NUMERO DE CUENTA REGISTRADO'),

-- JULIO
(2026, 7, 'ADMINISTRACION Y FINANZAS', 'Cartera', 'F5', 1, '1039', 'Eliminación', 'ERROR HUMANO AL DIGITAR EL NUMERO DE COMPROBANTE'),
(2026, 7, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L14', 4, '733-736', 'Eliminación', 'N/A'),

-- AGOSTO
(2026, 8, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'L14', 4, '737-740', 'Eliminación', 'N/A'),
(2026, 8, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'O2', 1, '289-300', 'Eliminación', 'N/A'),
(2026, 8, 'ADMINISTRACION Y FINANZAS', 'Contabilidad', 'O3', 1, '248-261', 'Eliminación', 'N/A');

-- Verificar:
-- SELECT mes, COUNT(*) FROM siimed_documentos WHERE anio = 2026 GROUP BY mes ORDER BY mes;
-- SELECT COUNT(*) FROM siimed_documentos WHERE anio = 2026;  -- esperado: 39
