-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de desplegar la Edge
-- Function "send-chat-push" (con "Enforce JWT Verification" desactivado).
--
-- Si el project ref de tu URL de Supabase cambiara, actualiza la URL
-- de abajo (la parte "bzrnjvalpwlcnpszvwim").

create extension if not exists pg_net;

create or replace function public.notify_chat_push()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url     := 'https://bzrnjvalpwlcnpszvwim.supabase.co/functions/v1/send-chat-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$;

drop trigger if exists trg_chat_push on public.mensajes;

create trigger trg_chat_push
  after insert on public.mensajes
  for each row
  execute function public.notify_chat_push();
