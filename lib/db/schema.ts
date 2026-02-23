import "server-only";
import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  pgView,
  smallint,
  text,
  timestamp,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

export type PollRow = typeof polls.$inferSelect;
export type OptionRow = typeof options.$inferSelect;
export type VoteRow = typeof votes.$inferSelect;
export type ReactionRow = typeof reactions.$inferSelect;
export type PollDetail = typeof polls_details.$inferSelect;

export type PollType = (typeof poll_type.enumValues)[number];
export type PollStatus = (typeof poll_status.enumValues)[number];

export type ReactionCount = PollDetail["reaction_breakdown"][number];

export const poll_type = pgEnum("poll_type", ["single", "rating", "text"]);
export const poll_status = pgEnum("poll_status", ["draft", "live"]);

export const polls = pgTable("polls", {
  id: text().primaryKey(),
  owner_email: text(),
  title: text().notNull(),
  description: text(),
  type: poll_type().notNull(),
  status: poll_status().notNull(),
  end_at: timestamp({ withTimezone: true }).notNull(),
  reaction_emojis: text().array(),
  created_at: timestamp({
    withTimezone: true
  })
    .notNull()
    .defaultNow(),
  updated_at: timestamp({
    withTimezone: true
  })
    .notNull()
    .defaultNow()
});

export const options = pgTable(
  "options",
  {
    id: text().primaryKey(),
    poll_id: text()
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    value: text().notNull(),
    created_at: timestamp({
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (t) => [
    index("idx_poll_options_poll_id").on(t.poll_id),
    unique("options_poll_id_id_unique").on(t.poll_id, t.id)
  ]
);

export const votes = pgTable(
  "votes",
  {
    id: text().primaryKey(),
    poll_id: text()
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    voter_key: text().notNull(),
    option_id: text(),
    rating: smallint(),
    comment: text(),
    created_at: timestamp({
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (t) => [
    unique("votes_poll_id_voter_key_unique").on(t.poll_id, t.voter_key),
    check("votes_rating_check", sql`${t.rating} >= 1 AND ${t.rating} <= 5`),
    foreignKey({
      name: "votes_poll_id_option_id_fkey",
      columns: [t.poll_id, t.option_id],
      foreignColumns: [options.poll_id, options.id]
    }).onDelete("set null"),
    index("idx_votes_poll_id").on(t.poll_id),
    index("idx_votes_option_id")
      .on(t.option_id)
      .where(sql`${t.option_id} IS NOT NULL`)
  ]
);

export const reactions = pgTable(
  "reactions",
  {
    id: text().primaryKey(),
    poll_id: text()
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    voter_key: text().notNull(),
    emoji: text().notNull(),
    created_at: timestamp({
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (t) => [
    unique("reactions_poll_id_voter_key_unique").on(t.poll_id, t.voter_key),
    index("idx_reactions_poll_id").on(t.poll_id)
  ]
);

export const polls_relations = relations(polls, ({ many }) => ({
  options: many(options),
  votes: many(votes),
  reactions: many(reactions)
}));

export const options_relations = relations(options, ({ one, many }) => ({
  poll: one(polls, {
    fields: [options.poll_id],
    references: [polls.id]
  }),
  votes: many(votes)
}));

export const votes_relations = relations(votes, ({ one }) => ({
  poll: one(polls, {
    fields: [votes.poll_id],
    references: [polls.id]
  }),
  option: one(options, {
    fields: [votes.option_id],
    references: [options.id]
  })
}));

export const reactions_relations = relations(reactions, ({ one }) => ({
  poll: one(polls, {
    fields: [reactions.poll_id],
    references: [polls.id]
  })
}));

export const polls_details = pgView("polls_details", {
  id: text().notNull(),
  owner_email: text(),
  title: text().notNull(),
  description: text(),
  type: poll_type().notNull(),
  status: poll_status().notNull(),
  end_at: timestamp({ withTimezone: true }).notNull(),
  reaction_emojis: text().array(),
  created_at: timestamp({
    withTimezone: true
  }).notNull(),
  updated_at: timestamp({
    withTimezone: true
  }).notNull(),
  total_votes: integer().notNull(),
  text_responses_count: integer().notNull(),
  rating_average: doublePrecision(),
  options: jsonb()
    .$type<
      Array<{
        id: string;
        poll_id: string;
        value: string;
        created_at: Date;
        votes: number;
      }>
    >()
    .notNull(),
  reaction_breakdown: jsonb()
    .$type<
      Array<{
        emoji: string;
        count: number;
      }>
    >()
    .notNull()
}).as(sql`
  SELECT
    p.id,
    p.owner_email,
    p.title,
    p.description,
    p.type,
    p.status,
    p.end_at,
    p.reaction_emojis,
    p.created_at,
    p.updated_at,
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
      avg(rating)::double precision AS rating_average
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
`);
