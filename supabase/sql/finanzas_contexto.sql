-- ─────────────────────────────────────────────
-- PRESUPUESTOS SEPARADOS: FAMILIA Y ESCUELA
-- Agrega la columna `contexto` a las tablas de finanzas para que el
-- presupuesto de la Escuela (Josué Polanco) viva aparte del familiar.
-- Los registros existentes quedan como 'familia': no se pierde ni se
-- mezcla nada.
--
-- Cómo aplicarlo: Supabase → SQL Editor → pegar este script → Run.
-- Después recarga la app y el botón "Finanzas Escuela" quedará activo.
-- ─────────────────────────────────────────────

alter table cuentas       add column if not exists contexto text not null default 'familia';
alter table transacciones add column if not exists contexto text not null default 'familia';
alter table deudas        add column if not exists contexto text not null default 'familia';

create index if not exists idx_cuentas_contexto       on cuentas (contexto);
create index if not exists idx_transacciones_contexto on transacciones (contexto);
create index if not exists idx_deudas_contexto        on deudas (contexto);
