CREATE TABLE "absences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"from_date" text NOT NULL,
	"to_date" text NOT NULL,
	"direction" text NOT NULL,
	"note" text,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid,
	"user_id" uuid,
	"action" text NOT NULL,
	"detail" jsonb,
	"ip" text,
	"at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boardings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"stop_id" text NOT NULL,
	"status" text NOT NULL,
	"method" text NOT NULL,
	"boarded_at" bigint,
	"at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"students" integer NOT NULL,
	"months" integer DEFAULT 1 NOT NULL,
	"subtotal" integer NOT NULL,
	"tax" integer NOT NULL,
	"total" integer NOT NULL,
	"status" text NOT NULL,
	"method" text,
	"wompi_id" text,
	"created_at" bigint DEFAULT (extract(epoch from now()) * 1000)::bigint NOT NULL,
	"paid_at" bigint,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "faces" (
	"student_id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"cipher" text NOT NULL,
	"consent_by" uuid NOT NULL,
	"consent_at" bigint NOT NULL,
	"consent_source" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"school_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "guardians_student_id_user_id_pk" PRIMARY KEY("student_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"run_at" bigint NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" bigint,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"trip_id" uuid,
	"read" boolean DEFAULT false NOT NULL,
	"at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"trip_id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"heading" double precision,
	"speed" double precision,
	"at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"direction" text NOT NULL,
	"days" jsonb NOT NULL,
	"start_time" text NOT NULL,
	"vehicle_id" uuid,
	"driver_id" uuid,
	"stops" jsonb NOT NULL,
	"path" text,
	"active" boolean DEFAULT true NOT NULL,
	"late_alert_date" text
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"location" jsonb,
	"grades" jsonb NOT NULL,
	"created_at" bigint DEFAULT (extract(epoch from now()) * 1000)::bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"created_at" bigint DEFAULT (extract(epoch from now()) * 1000)::bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stop_times" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"route_id" uuid,
	"trip_id" uuid NOT NULL,
	"stop_id" text NOT NULL,
	"date" text NOT NULL,
	"planned_min" integer NOT NULL,
	"predicted_min" integer,
	"actual_min" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"grade" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"home" jsonb,
	"note" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" bigint DEFAULT (extract(epoch from now()) * 1000)::bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"school_id" uuid PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"price_per_student" integer NOT NULL,
	"trial_ends_at" bigint NOT NULL,
	"paid_until" bigint,
	"legal_name" text,
	"tax_id" text,
	"billing_email" text,
	"reminded_for" text
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"route_id" uuid,
	"route_name" text NOT NULL,
	"date" text NOT NULL,
	"direction" text NOT NULL,
	"driver_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"status" text NOT NULL,
	"started_at" bigint NOT NULL,
	"ended_at" bigint,
	"departed_at" bigint,
	"stops" jsonb NOT NULL,
	"path" text,
	"stop_index" integer DEFAULT 0 NOT NULL,
	"delay_min" integer DEFAULT 0 NOT NULL,
	"near_notified" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"predicted" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notices" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"role" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"verified_at" bigint,
	"login" jsonb,
	"created_at" bigint DEFAULT (extract(epoch from now()) * 1000)::bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"plate" text DEFAULT '' NOT NULL,
	"capacity" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "absences" ADD CONSTRAINT "absences_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absences" ADD CONSTRAINT "absences_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absences" ADD CONSTRAINT "absences_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardings" ADD CONSTRAINT "boardings_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardings" ADD CONSTRAINT "boardings_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardings" ADD CONSTRAINT "boardings_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faces" ADD CONSTRAINT "faces_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faces" ADD CONSTRAINT "faces_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faces" ADD CONSTRAINT "faces_consent_by_users_id_fk" FOREIGN KEY ("consent_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stop_times" ADD CONSTRAINT "stop_times_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stop_times" ADD CONSTRAINT "stop_times_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stop_times" ADD CONSTRAINT "stop_times_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "absences_school_to" ON "absences" USING btree ("school_id","to_date");--> statement-breakpoint
CREATE INDEX "absences_student" ON "absences" USING btree ("student_id","to_date");--> statement-breakpoint
CREATE INDEX "audit_school_at" ON "audit_log" USING btree ("school_id","at");--> statement-breakpoint
CREATE UNIQUE INDEX "boardings_trip_student" ON "boardings" USING btree ("trip_id","student_id");--> statement-breakpoint
CREATE INDEX "boardings_student_at" ON "boardings" USING btree ("student_id","at");--> statement-breakpoint
CREATE UNIQUE INDEX "charges_reference" ON "charges" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "charges_school" ON "charges" USING btree ("school_id","created_at");--> statement-breakpoint
CREATE INDEX "faces_school" ON "faces" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "guardians_user" ON "guardians" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "guardians_school" ON "guardians" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "jobs_run_at" ON "jobs" USING btree ("run_at");--> statement-breakpoint
CREATE INDEX "notifications_user_at" ON "notifications" USING btree ("user_id","at");--> statement-breakpoint
CREATE UNIQUE INDEX "push_endpoint" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_user" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "routes_school" ON "routes" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "routes_driver" ON "routes" USING btree ("driver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stop_times_route_stop" ON "stop_times" USING btree ("route_id","stop_id","date");--> statement-breakpoint
CREATE INDEX "students_school" ON "students" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trips_route_date" ON "trips" USING btree ("route_id","date");--> statement-breakpoint
CREATE INDEX "trips_school_date" ON "trips" USING btree ("school_id","date");--> statement-breakpoint
CREATE INDEX "trips_driver_date" ON "trips" USING btree ("driver_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_school_role" ON "users" USING btree ("school_id","role");--> statement-breakpoint
CREATE INDEX "vehicles_school" ON "vehicles" USING btree ("school_id");