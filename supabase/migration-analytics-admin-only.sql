-- Réserve à l'admin les deux fonctions de statistiques qui étaient lisibles par tout le monde
-- (même sans compte) : analytics_totals et analytics_app_insights.
-- Leur contenu ne change pas : on les renomme en version « interne » (inaccessible de l'extérieur)
-- et on remet à leur place une fonction du même nom qui vérifie is_admin() avant de répondre.
-- Peut être relancé sans risque.

do $$
begin
  if to_regprocedure('public.analytics_totals_interne()') is null then
    alter function public.analytics_totals() rename to analytics_totals_interne;
  end if;
  if to_regprocedure('public.analytics_app_insights_interne()') is null then
    alter function public.analytics_app_insights() rename to analytics_app_insights_interne;
  end if;
end $$;

revoke all on function public.analytics_totals_interne() from public, anon, authenticated;
revoke all on function public.analytics_app_insights_interne() from public, anon, authenticated;

create or replace function public.analytics_totals()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur'; end if;
  return public.analytics_totals_interne();
end; $$;

create or replace function public.analytics_app_insights()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur'; end if;
  return public.analytics_app_insights_interne();
end; $$;

revoke all on function public.analytics_totals() from public, anon;
revoke all on function public.analytics_app_insights() from public, anon;
grant execute on function public.analytics_totals() to authenticated;
grant execute on function public.analytics_app_insights() to authenticated;
