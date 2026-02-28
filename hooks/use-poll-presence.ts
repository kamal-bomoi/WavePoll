"use client";

import { useEffect } from "react";
import { HEARTBEAT_INTERVAL_MS, VIEWER_ID_KEY } from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";

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

let memory_viewer_id: string | undefined;

function get_or_create_viewer_id(): string {
  try {
    const existing = window.localStorage.getItem(VIEWER_ID_KEY);

    if (existing) return existing;

    const value = nanoid();
    window.localStorage.setItem(VIEWER_ID_KEY, value);

    return value;
  } catch {
    if (!memory_viewer_id) memory_viewer_id = nanoid();

    return memory_viewer_id;
  }
}

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
