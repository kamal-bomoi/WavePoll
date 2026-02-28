import "server-only";
import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { env } from "@/env";
import type { Poll } from "@/types";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function send_poll_ended_summary_email({
  poll,
  owner_email
}: {
  poll: Poll;
  owner_email: string;
}): Promise<void> {
  if (!resend || !env.EMAIL_FROM) return;

  const result_url = `${env.APP_BASE_URL}/studio/${poll.id}/result`;
  const subject = `Your WavePoll has ended: ${poll.title}`;
  const top_options = poll.options
    .slice()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

  const text = build_text_summary({ poll, result_url, top_options });
  const html = build_rich_html({ poll, result_url, top_options });

  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: [owner_email],
      subject,
      text,
      html
    });

    if (error)
      Sentry.withScope((scope) => {
        scope.setExtra(
          "message",
          `Resend ErrorResponse. Failed to send poll summary email for poll ${poll.id}.`
        );

        Sentry.captureException(error);
      });
  } catch (e) {
    Sentry.withScope((scope) => {
      scope.setExtra(
        "message",
        `Failed to send poll summary email for poll ${poll.id}.`
      );

      Sentry.captureException(e);
    });
  }
}

function build_text_summary({
  poll,
  result_url,
  top_options
}: {
  poll: Poll;
  result_url: string;
  top_options: Poll["options"];
}): string {
  return [
    "WavePoll",
    "",
    `Your poll "${poll.title}" has ended.`,
    "",
    "Summary",
    `- Total votes: ${poll.total_votes}`,
    `- Poll type: ${poll.type}`,
    poll.type === "rating" && typeof poll.rating_average === "number"
      ? `- Average rating: ${poll.rating_average.toFixed(1)} / 5`
      : null,
    poll.type === "text"
      ? `- Text responses: ${poll.text_responses_count}`
      : null,
    top_options.length
      ? `- Top options:\n${top_options
          .map((option) => {
            const label =
              poll.type === "image"
                ? to_public_s3_url(option.value)
                : option.value;

            return `  - ${label}: ${option.votes} vote(s)`;
          })
          .join("\n")}`
      : null,
    "",
    `View full results: ${result_url}`
  ]
    .filter(Boolean)
    .join("\n");
}

function build_rich_html({
  poll,
  result_url,
  top_options
}: {
  poll: Poll;
  result_url: string;
  top_options: Poll["options"];
}): string {
  const title = escape_html(poll.title);
  const type = escape_html(poll.type);
  const rating =
    poll.type === "rating" && typeof poll.rating_average === "number"
      ? `<div class="stat"><span class="label">Average rating</span><span class="value">${poll.rating_average.toFixed(
          1
        )} / 5</span></div>`
      : "";
  const text_count =
    poll.type === "text"
      ? `<div class="stat"><span class="label">Text responses</span><span class="value">${poll.text_responses_count}</span></div>`
      : "";
  const is_image_poll = poll.type === "image";
  const options_html = top_options.length
    ? `
      <div class="card">
        <h3>Top options</h3>
        <ul>
          ${top_options
            .map((option) => {
              if (!is_image_poll)
                return `<li><span>${escape_html(option.value)}</span><b>${option.votes}</b></li>`;

              return `<li><span class="image-row"><img src="${escape_html(
                to_public_s3_url(option.value)
              )}" alt="Poll option" /><span>${option.votes} vote(s)</span></span></li>`;
            })
            .join("")}
        </ul>
      </div>
    `
    : "";

  return `
<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { margin: 0; padding: 0; background: #f7f7ff; font-family: Inter, Segoe UI, Arial, sans-serif; color: #0f172a; }
      .container { max-width: 620px; margin: 24px auto; background: #ffffff; border: 1px solid #e7e7ff; border-radius: 18px; overflow: hidden; }
      .hero { padding: 28px 24px; background: linear-gradient(145deg, #eef2ff 0%, #f5f3ff 65%, #f7f7ff 100%); border-bottom: 1px solid #e8eaff; }
      .brand { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #4f46e514; color: #4f46e5; font-size: 12px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
      h1 { margin: 12px 0 8px; font-size: 24px; line-height: 1.25; color: #111827; }
      p { margin: 0; color: #475569; }
      .content { padding: 22px 24px 26px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
      .stat { border: 1px solid #e8eaff; background: #fcfcff; border-radius: 12px; padding: 12px; }
      .label { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; }
      .value { display: block; font-weight: 700; color: #0f172a; font-size: 16px; }
      .card { border: 1px solid #e8eaff; border-radius: 12px; padding: 14px; background: #ffffff; margin-top: 10px; }
      .card h3 { margin: 0 0 10px; font-size: 14px; color: #111827; }
      .card ul { list-style: none; margin: 0; padding: 0; }
      .card li { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid #f1f3ff; font-size: 14px; color: #334155; }
      .card li:first-child { border-top: 0; }
      .image-row { display: inline-flex; align-items: center; gap: 10px; }
      .image-row img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; border: 1px solid #e8eaff; display: block; }
      .cta-wrap { margin-top: 18px; }
      .cta { display: inline-block; text-decoration: none; background: #4f46e5; color: #ffffff !important; padding: 11px 16px; border-radius: 10px; font-weight: 600; }
      .footer { border-top: 1px solid #eef0ff; padding: 14px 24px 18px; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="hero">
        <span class="brand">WavePoll</span>
        <h1>Your poll has ended</h1>
        <p><strong>${title}</strong></p>
      </div>
      <div class="content">
        <div class="grid">
          <div class="stat"><span class="label">Total votes</span><span class="value">${poll.total_votes}</span></div>
          <div class="stat"><span class="label">Poll type</span><span class="value">${type}</span></div>
          ${rating}
          ${text_count}
        </div>
        ${options_html}
        <div class="cta-wrap">
          <a class="cta" href="${result_url}">View full results</a>
        </div>
      </div>
      <div class="footer">You received this because you provided this email when creating a poll.</div>
    </div>
  </body>
</html>
`.trim();
}

function escape_html(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function to_public_s3_url(key: string): string {
  const base = env.NEXT_PUBLIC_S3_URL.replace(/\/+$/, "");
  const normalized_key = key.replace(/^\/+/, "");

  return `${base}/${normalized_key}`;
}
