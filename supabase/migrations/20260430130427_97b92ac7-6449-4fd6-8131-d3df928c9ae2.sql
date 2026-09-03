CREATE OR REPLACE FUNCTION public.assign_package_custom_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  candidate text;
  attempts int := 0;
BEGIN
  IF NEW.is_custom IS TRUE AND (NEW.custom_id IS NULL OR length(btrim(NEW.custom_id)) = 0) THEN
    LOOP
      candidate := 'CUS-' || upper(lpad(to_hex((floor(random() * 65536))::int), 4, '0'));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.packages WHERE custom_id = candidate);
      attempts := attempts + 1;
      IF attempts > 20 THEN
        candidate := 'CUS-' || upper(lpad(to_hex((floor(random() * 16777216))::int), 6, '0'));
        EXIT;
      END IF;
    END LOOP;
    NEW.custom_id := candidate;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS assign_package_custom_id_trigger ON public.packages;
CREATE TRIGGER assign_package_custom_id_trigger
BEFORE INSERT ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.assign_package_custom_id();