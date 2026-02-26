"use client";

import { useEffect } from "react";
import { HEARTBEAT_INTERVAL_MS, VIEWER_ID_KEY } from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";

/**
 * Maintain and report the viewer's presence for a given poll.
 *
 * When `poll_id` is provided, this hook ensures a persistent viewer identifier exists,
 * immediately notifies the server that the viewer joined, periodically sends heartbeat
 * presence events while the component is active, and notifies the server when the viewer
 * leaves or the page is hidden. Cleans up timers and event listeners on unmount or when
 * `poll_id` changes.
 *
 * @param poll_id - The poll identifier to join; if `undefined`, the hook is a no-op.
 */
export function usePollPresence(poll_id: string | undefined): void {
  useEffect(() => {
    if (!poll_id) return;

    const viewer_id = get_or_create_viewer_id();
    let active = true;
    let left = false;

    void send_presence({ poll_id, viewer_id, action: "join" });

    const timer = window.setInterval(() => {
      if (!active) return;

      void send_presence({ poll_id, viewer_id, action: "heartbeat" });
    }, HEARTBEAT_INTERVAL_MS);

    const leave_once = () => {
      if (left) return;

      left = true;

      void send_presence({
        poll_id,
        viewer_id,
        action: "leave",
        keepalive: true
      });
    };

    const on_page_hide = () => {
      leave_once();
    };

    window.addEventListener("pagehide", on_page_hide);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("pagehide", on_page_hide);
      leave_once();
    };
  }, [poll_id]);
}

/**
 * Retrieve a persistent viewer identifier, creating and persisting one if none exists.
 *
 * Attempts to read the identifier stored under `VIEWER_ID_KEY` in localStorage and returns it if present.
 * If absent, generates a new ID with `nanoid()`, stores it under `VIEWER_ID_KEY`, and returns it.
 * If any error occurs (for example, localStorage access failure), returns a newly generated `nanoid()` without persisting it.
 *
 * @returns A viewer identifier string; persisted to localStorage when possible.
 */
function get_or_create_viewer_id(): string {
  try {
    const existing = window.localStorage.getItem(VIEWER_ID_KEY);

    if (existing) return existing;

    const value = nanoid();
    window.localStorage.setItem(VIEWER_ID_KEY, value);

    return value;
  } catch {
    return nanoid();
  }
}

/**
 * Send a presence event for a viewer in a poll to the server.
 *
 * Performs an HTTP POST to /api/polls/{poll_id}/presence with a JSON body containing
 * the `action` and `viewer_id`. Network or fetch errors are caught and ignored.
 *
 * @param poll_id - The poll identifier to send the presence event for
 * @param viewer_id - The persistent identifier for the viewing user
 * @param action - The presence action: `"join"`, `"heartbeat"`, or `"leave"`
 * @param keepalive - If true, pass the `keepalive` option to `fetch` so the request may outlive the page unload
 */
async function send_presence({
  poll_id,
  viewer_id,
  action,
  keepalive = false
}: {
  poll_id: string;
  viewer_id: string;
  action: "join" | "heartbeat" | "leave";
  keepalive?: boolean;
}): Promise<void> {
  try {
    await fetch(`/api/polls/${poll_id}/presence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      keepalive,
      body: JSON.stringify({
        action,
        viewer_id
      })
    });
  } catch {}
}
