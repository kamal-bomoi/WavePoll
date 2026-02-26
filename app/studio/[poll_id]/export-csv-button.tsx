import { Button, Tooltip } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Poll } from "@/types";

/**
 * Renders a button that lets the poll owner export the poll's results as a CSV file after the poll has ended.
 *
 * When the current user is the poll owner and `has_ended` is true, an enabled button is shown that starts an export
 * (after user confirmation) and disables while exporting. Otherwise a disabled button wrapped in a tooltip explaining
 * why export is unavailable is rendered.
 *
 * @param poll - The poll whose results will be exported.
 * @param has_ended - Whether the poll has finished and export is allowed.
 * @param is_owner_view - Whether the current view belongs to the poll owner.
 * @returns The button (JSX element) used to trigger or indicate CSV export availability.
 */
export function ExportCSVButton({
  poll,
  has_ended,
  is_owner_view
}: {
  poll: Poll;
  has_ended: boolean;
  is_owner_view: boolean;
}) {
  const [is_exporting, set_is_exporting] = useState(false);

  function export_csv() {
    if (is_exporting) return;

    if (!window.confirm("Export the full poll results as CSV?")) return;

    set_is_exporting(true);

    download_csv(poll.id, () => set_is_exporting(false));
  }

  const can_export = is_owner_view && has_ended;
  const tooltip = !is_owner_view
    ? "Export is only available to the poll owner."
    : !has_ended
      ? "Export is available only after the poll ends."
      : null;

  if (can_export)
    return (
      <Button
        variant="subtle"
        leftSection={<IconDownload size={16} />}
        disabled={is_exporting}
        onClick={export_csv}
      >
        Export CSV
      </Button>
    );

  return (
    <Tooltip label={tooltip}>
      <span>
        <Button
          variant="subtle"
          leftSection={<IconDownload size={16} />}
          disabled
        >
          Export CSV
        </Button>
      </span>
    </Tooltip>
  );
}

/**
 * Initiates fetching of a poll's CSV export, triggers a browser download, and shows toast status messages.
 *
 * Fetches /api/polls/{poll_id}/export with credentials included, displays "Preparing CSV..." while in progress, shows "CSV generated." on success or a server-provided error message on failure, starts a download named "{poll_id}-results.csv", and invokes `cb` after completion.
 *
 * @param poll_id - The poll identifier used for the export request and as the download filename prefix.
 * @param cb - Callback invoked once the export operation completes (runs on both success and failure).
 */
function download_csv(poll_id: string, cb: () => void) {
  toast.promise(
    (async () => {
      const response = await fetch(`/api/polls/${poll_id}/export`, {
        credentials: "include"
      });

      if (!response.ok) {
        let message = "Failed to export CSV.";

        try {
          const payload = (await response.json()) as {
            errors?: { message?: string }[];
          };
          const next_message = payload.errors?.[0]?.message;

          if (next_message) message = next_message;
        } catch {}

        throw new Error(message);
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${poll_id}-results.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(href);
    })(),
    {
      loading: "Preparing CSV...",
      success: "CSV generated.",
      error: (error) =>
        error instanceof Error ? error.message : "Failed to export CSV.",
      finally: cb
    }
  );
}
