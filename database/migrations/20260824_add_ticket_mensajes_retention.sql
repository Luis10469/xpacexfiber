-- Agrega columnas resumen a tickets para conservar un rastro de la
-- conversación antes de purgar mensajes con más de 7 días de antigüedad.
-- No elimina ni afecta ningún ticket, solo agrega columnas nuevas.

IF COL_LENGTH('tickets', 'mensajes_total') IS NULL
  ALTER TABLE tickets ADD mensajes_total INT NULL;
GO

IF COL_LENGTH('tickets', 'fecha_ultimo_mensaje') IS NULL
  ALTER TABLE tickets ADD fecha_ultimo_mensaje DATETIME NULL;
GO
