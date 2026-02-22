import { Button, Tooltip } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Poll } from "@/types";

export function ExportCSVButton({
  poll,
  has_ended
}: {
  poll: Poll;
  has_ended: boolean;
}) {
  const [is_exporting, set_is_exporting] = useState(false);

  function export_csv() {
    if (is_exporting) return;

    if (!window.confirm("Export the full poll results as CSV?")) return;

    set_is_exporting(true);

    download_csv(poll.id, () => set_is_exporting(false));
  }

  if (has_ended)
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
    <Tooltip label="Export is available only after the poll ends.">
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
      anchor.click();
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
