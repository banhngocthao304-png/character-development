REVOKE ALL ON FUNCTION public.resolve_exercise_library_id(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_pt_exercise_library_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_exercise_library_id(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_pt_exercise_library_id() TO service_role;