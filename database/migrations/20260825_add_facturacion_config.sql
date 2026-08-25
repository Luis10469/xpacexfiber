-- Prepara la facturación semiautomática: día de facturación y días de
-- vencimiento configurables por cliente, y referencia al plan facturado
-- en cada factura. Todo aditivo y nullable, no afecta filas existentes.
-- NO activa ninguna generación automática de facturas.

IF COL_LENGTH('clientes', 'dia_facturacion') IS NULL
  ALTER TABLE clientes ADD dia_facturacion INT NULL;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.check_constraints WHERE name = 'CK_clientes_dia_facturacion'
)
  ALTER TABLE clientes
    ADD CONSTRAINT CK_clientes_dia_facturacion
    CHECK (dia_facturacion IS NULL OR dia_facturacion BETWEEN 1 AND 31);
GO

IF COL_LENGTH('clientes', 'dias_vencimiento') IS NULL
  ALTER TABLE clientes ADD dias_vencimiento INT NULL;
GO

IF COL_LENGTH('facturas', 'plan_id') IS NULL
  ALTER TABLE facturas ADD plan_id INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_facturas_plan')
  ALTER TABLE facturas
    ADD CONSTRAINT FK_facturas_plan
    FOREIGN KEY (plan_id) REFERENCES planes(id);
GO
