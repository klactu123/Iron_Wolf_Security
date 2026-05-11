"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/client/api";

export function RegenerateButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function regenerate() {
    setBusy(true);
    await apiPost("/api/report", {});
    router.refresh();
    setBusy(false);
  }

  return (
    <Button onClick={regenerate} disabled={busy}>
      {busy ? "Regenerating…" : "Regenerate report"}
    </Button>
  );
}
