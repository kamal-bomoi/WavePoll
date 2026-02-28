CREATE TYPE "public"."poll_status" AS ENUM('draft', 'live');--> statement-breakpoint
CREATE TYPE "public"."poll_type" AS ENUM('single', 'rating', 'text', 'image');--> statement-breakpoint
CREATE TABLE "options" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "options_poll_id_id_unique" UNIQUE("poll_id","id")
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"owner_email" text,
	"title" text NOT NULL,
	"description" text,
	"type" "poll_type" NOT NULL,
	"status" "poll_status" NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"reaction_emojis" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"anon_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_poll_id_anon_id_unique" UNIQUE("poll_id","anon_id")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"anon_id" text NOT NULL,
	"option_id" text,
	"rating" smallint,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_poll_id_anon_id_unique" UNIQUE("poll_id","anon_id"),
	CONSTRAINT "votes_rating_check" CHECK ("votes"."rating" >= 1 AND "votes"."rating" <= 5),
	CONSTRAINT "votes_exactly_one" CHECK (num_nonnulls("votes"."option_id", "votes"."rating", "votes"."comment") = 1)
);
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_poll_options_poll_id" ON "options" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "idx_polls_owner_id" ON "polls" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_reactions_poll_id" ON "reactions" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "idx_votes_poll_id" ON "votes" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "idx_votes_option_id" ON "votes" USING btree ("option_id") WHERE "votes"."option_id" IS NOT NULL;--> statement-breakpoint
CREATE VIEW "public"."polls_details" AS (
  SELECT
    p.id,
    p.owner_id,
    p.owner_email,
    p.title,
    p.description,
    p.type,
    p.status,
    p.end_at,
    p.reaction_emojis,
    p.created_at,
    p.updated_at,
    v.last_voted_at,
    COALESCE(v.total_votes, 0)::int AS total_votes,
    COALESCE(v.text_responses_count, 0)::int AS text_responses_count,
    v.rating_average,
    COALESCE(opt.options, '[]'::jsonb) AS options,
    COALESCE(rb.reaction_breakdown, '[]'::jsonb) AS reaction_breakdown
  FROM polls p
  LEFT JOIN (
    SELECT
      poll_id,
      count(*)::int AS total_votes,
      count(comment)::int AS text_responses_count,
      avg(rating)::double precision AS rating_average,
      max(created_at) AS last_voted_at
    FROM votes
    GROUP BY poll_id
  ) v ON v.poll_id = p.id
  LEFT JOIN LATERAL (
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'poll_id', o.poll_id,
          'value', o.value,
          'created_at', o.created_at,
          'votes', COALESCE(ov.votes, 0)::int
        ) ORDER BY o.created_at ASC
      ) AS options
    FROM options o
    LEFT JOIN (
      SELECT option_id, count(*)::int AS votes
      FROM votes
      WHERE option_id IS NOT NULL AND poll_id = p.id
      GROUP BY option_id
    ) ov ON ov.option_id = o.id
    WHERE o.poll_id = p.id
  ) opt ON true
  LEFT JOIN LATERAL (
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'emoji', e.emoji,
          'count', COALESCE(rc.count, 0)::int
        ) ORDER BY e.ord ASC
      ) AS reaction_breakdown
    FROM unnest(p.reaction_emojis) WITH ORDINALITY AS e(emoji, ord)
    LEFT JOIN (
      SELECT emoji, count(*)::int AS count
      FROM reactions
      WHERE poll_id = p.id
      GROUP BY emoji
    ) rc ON rc.emoji = e.emoji
  ) rb ON true
);