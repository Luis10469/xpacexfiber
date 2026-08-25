-- Amplía facturas para el módulo de Facturación, sin afectar las filas
-- existentes (la tabla tiene 0 filas hoy). No renombra ni toca monto,
-- fecha_emision, fecha_vencimiento ni cliente_id, que ya usa reportes.service.js.

IF COL_LENGTH('facturas', 'numero') IS NULL
  ALTER TABLE facturas ADD numero VARCHAR(20) NULL;
GO

IF COL_LENGTH('facturas', 'periodo') IS NULL
  ALTER TABLE facturas ADD periodo VARCHAR(50) NULL;
GO

IF COL_LENGTH('facturas', 'concepto') IS NULL
  ALTER TABLE facturas ADD concepto VARCHAR(255) NULL;
GO

IF COL_LENGTH('facturas', 'created_at') IS NULL
  ALTER TABLE facturas ADD created_at DATETIME NULL CONSTRAINT DF_facturas_created_at DEFAULT GETDATE();
GO

IF COL_LENGTH('facturas', 'updated_at') IS NULL
  ALTER TABLE facturas ADD updated_at DATETIME NULL CONSTRAINT DF_facturas_updated_at DEFAULT GETDATE();
GO

-- Amplía el CHECK de estado para incluir 'anulada'. SQL Server no permite
-- dos CHECK que se solapen (son AND, no OR), así que hay que eliminar el
-- constraint actual (nombre buscado dinámicamente) y crear uno nuevo con
-- los 4 valores. Todo en minúsculas, igual que reportes.service.js.

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints dc
  JOIN sys.tables t ON dc.parent_object_id = t.object_id
  WHERE t.name = 'facturas'
    AND dc.definition LIKE '%anulada%'
)
BEGIN
  DECLARE @nombreConstraint NVARCHAR(200);

  SELECT TOP 1 @nombreConstraint = dc.name
  FROM sys.check_constraints dc
  JOIN sys.tables t ON dc.parent_object_id = t.object_id
  JOIN sys.columns col
    ON col.object_id = t.object_id
    AND col.column_id = dc.parent_column_id
  WHERE t.name = 'facturas'
    AND col.name = 'estado';

  IF @nombreConstraint IS NOT NULL
  BEGIN
    DECLARE @sqlDrop NVARCHAR(400) =
      N'ALTER TABLE facturas DROP CONSTRAINT ' + QUOTENAME(@nombreConstraint);

    EXEC sp_executesql @sqlDrop;
  END

  ALTER TABLE facturas
    ADD CONSTRAINT CK_facturas_estado
    CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'anulada'));
END
GO
