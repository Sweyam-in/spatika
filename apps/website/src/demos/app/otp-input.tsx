import { OtpInput } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [status, setStatus] = useState("Enter the 6-digit code we sent to your phone.");
  return (
    <div className="grid gap-3">
      <OtpInput length={6} groupSize={3} onComplete={(code) => setStatus(`Verifying ${code}…`)} />
      <p className="text-body-sm text-fg-secondary" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
