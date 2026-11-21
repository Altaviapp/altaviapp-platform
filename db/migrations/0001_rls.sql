-- Seguridad por fila: segunda barrera de aislamiento entre colegios.
-- Cada transacción fija `app.scope` con el id del colegio de la sesión, o 'system'
-- para tareas internas (acceso, cola de tareas, webhook de pagos, consola del dueño).
-- Sin `app.scope` no se ve ninguna fila. FORCE aplica también al dueño de las tablas:
-- la aplicación debe conectarse con un rol que NO sea superusuario.
CREATE FUNCTION app_scope() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_setting('app.scope', true) $$;
--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','students','guardians','faces','vehicles','routes','trips','positions','boardings','stop_times','absences','subscriptions','charges']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY school_isolation ON %I USING (app_scope() = ''system'' OR school_id::text = app_scope()) WITH CHECK (app_scope() = ''system'' OR school_id::text = app_scope())', t);
  END LOOP;

  -- Tablas que cuelgan de un usuario: visibles solo si ese usuario es visible.
  FOREACH t IN ARRAY ARRAY['sessions','notifications','push_subscriptions']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY via_user ON %I USING (app_scope() = ''system'' OR user_id IN (SELECT id FROM users)) WITH CHECK (app_scope() = ''system'' OR user_id IN (SELECT id FROM users))', t);
  END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE schools FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY school_isolation ON schools USING (app_scope() = 'system' OR id::text = app_scope()) WITH CHECK (app_scope() = 'system' OR id::text = app_scope());
--> statement-breakpoint
-- Cola de tareas y límites: cualquiera encola; solo el sistema lee y ejecuta.
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY enqueue ON jobs FOR INSERT WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY system_only ON jobs USING (app_scope() = 'system');
--> statement-breakpoint
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE rate_limits FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY system_only ON rate_limits USING (app_scope() = 'system') WITH CHECK (app_scope() = 'system');
--> statement-breakpoint
-- Bitácora: cada colegio escribe y lee la suya; el sistema, todas.
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY school_isolation ON audit_log USING (app_scope() = 'system' OR school_id::text = app_scope()) WITH CHECK (app_scope() = 'system' OR school_id::text = app_scope());
