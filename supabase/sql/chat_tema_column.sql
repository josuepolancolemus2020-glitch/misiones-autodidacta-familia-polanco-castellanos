-- Ejecutar en Supabase -> SQL Editor.
-- Agrega la columna "tema" a los mensajes del chat, para poder
-- etiquetarlos con un tema predeterminado (Escuela, Finanzas, Salud,
-- Hogar, Eventos) y filtrar el historial por tema. Los mensajes que
-- ya existen quedan como "General" por defecto.

alter table public.mensajes
  add column if not exists tema text not null default 'General';
