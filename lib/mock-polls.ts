import type { Poll } from "@/types";
import { nanoid } from "@/utils/nanoid";

const now = new Date();

export const mock_polls: Poll[] = [
  {
    id: "wave-launch",
    owner_email: "host@wavepoll.app",
    title: "What should be WavePoll's launch keynote format?",
    description:
      "Audience vote decides how the opening demo is presented live.",
    type: "single",
    lifecycle: "live",
    options: [
      {
        id: nanoid(),
        label: "Rapid live coding sprint",
        votes: 54,
        trend: [
          { label: "10m", votes: 10 },
          { label: "8m", votes: 19 },
          { label: "6m", votes: 28 },
          { label: "4m", votes: 41 },
          { label: "2m", votes: 49 },
          { label: "Now", votes: 54 }
        ]
      },
      {
        id: nanoid(),
        label: "Architecture deep dive",
        votes: 33,
        trend: [
          { label: "10m", votes: 4 },
          { label: "8m", votes: 7 },
          { label: "6m", votes: 15 },
          { label: "4m", votes: 20 },
          { label: "2m", votes: 29 },
          { label: "Now", votes: 33 }
        ]
      },
      {
        id: nanoid(),
        label: "Feature speedrun and Q&A",
        votes: 17,
        trend: [
          { label: "10m", votes: 3 },
          { label: "8m", votes: 4 },
          { label: "6m", votes: 8 },
          { label: "4m", votes: 11 },
          { label: "2m", votes: 14 },
          { label: "Now", votes: 17 }
        ]
      }
    ],
    start_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    end_at: new Date(now.getTime() + 65 * 60 * 1000).toISOString(),
    allow_multiple_votes: false,
    presence: 238,
    reaction_emojis: [
      "\u{1F44F}",
      "\u{1F525}",
      "\u{1F4A1}",
      "\u{1F680}",
      "\u2764\uFE0F"
    ],
    reactions_count: 429,
    text_responses_count: 0,
    total_votes: 104,
    embed_url: "/embed/wave-launch",
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 2 * 60 * 1000).toISOString()
  },
  {
    id: "v2-feedback",
    owner_email: "host@wavepoll.app",
    title: "Rate the v2 UI experience",
    description: "Score the visual design and flow from 1 to 5 stars.",
    type: "rating",
    lifecycle: "live",
    options: [],
    start_at: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    end_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    allow_multiple_votes: false,
    presence: 98,
    reaction_emojis: [
      "\u{2B50}",
      "\u{1F44F}",
      "\u{1F525}",
      "\u{1F64C}",
      "\u{1F680}"
    ],
    reactions_count: 177,
    text_responses_count: 0,
    total_votes: 142,
    rating_average: 4.6,
    embed_url: "/embed/v2-feedback",
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 60 * 1000).toISOString()
  },
  {
    id: "retro-notes",
    owner_email: "host@wavepoll.app",
    title: "Drop one idea for the next release",
    description: "Free-text responses appear in a moderated feedback stream.",
    type: "text",
    lifecycle: "draft",
    options: [],
    start_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    end_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    allow_multiple_votes: false,
    presence: 0,
    reactions_count: 0,
    text_responses_count: 0,
    total_votes: 0,
    embed_url: "/embed/retro-notes",
    created_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
  }
];

export function get_mock_poll(poll_id: string): Poll | undefined {
  return mock_polls.find((poll) => poll.id === poll_id);
}
