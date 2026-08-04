REVOKE EXECUTE ON FUNCTION public.refresh_sector_aggregates(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_sector_aggregates(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.refresh_sector_aggregates(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_sector_aggregates(uuid) TO authenticated, service_role;