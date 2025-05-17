CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password" text,
	"pincode" text,
	"is_verified" boolean DEFAULT false,
	"verification_code" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
