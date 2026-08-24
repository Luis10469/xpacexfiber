-- Amplía noticias y notificaciones para soportar publicación dirigida
-- (todos los usuarios / usuarios específicos) sin afectar las filas existentes.

-- noticias: quién la publicó y a quién va dirigida
IF COL_LENGTH('noticias', 'destinatario_tipo') IS NULL
  ALTER TABLE noticias
    ADD destinatario_tipo VARCHAR(20)
        NOT NULL
        CONSTRAINT DF_noticias_destinatario_tipo DEFAULT 'todos';
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_noticias_destinatario_tipo')
  ALTER TABLE noticias
    ADD CONSTRAINT CK_noticias_destinatario_tipo
    CHECK (destinatario_tipo IN ('todos', 'especificos'));
GO

IF COL_LENGTH('noticias', 'emisor_id') IS NULL
  ALTER TABLE noticias ADD emisor_id INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_noticias_emisor')
  ALTER TABLE noticias
    ADD CONSTRAINT FK_noticias_emisor
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id);
GO

-- notificaciones: back-link a noticias + fecha de lectura
IF COL_LENGTH('notificaciones', 'noticia_id') IS NULL
  ALTER TABLE notificaciones ADD noticia_id INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_notificaciones_noticia')
  ALTER TABLE notificaciones
    ADD CONSTRAINT FK_notificaciones_noticia
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE;
GO

IF COL_LENGTH('notificaciones', 'leido_at') IS NULL
  ALTER TABLE notificaciones ADD leido_at DATETIME NULL;
GO

-- Evita destinatarios duplicados para una misma noticia.
-- Filtrado a noticia_id IS NOT NULL: no choca con las filas antiguas (noticia_id NULL).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_notificaciones_noticia_usuario')
  CREATE UNIQUE INDEX UX_notificaciones_noticia_usuario
    ON notificaciones (noticia_id, usuario_id)
    WHERE noticia_id IS NOT NULL;
GO
