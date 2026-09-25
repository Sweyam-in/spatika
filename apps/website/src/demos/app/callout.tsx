import { Callout } from "@spatika/react";

export default function Demo() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Callout variant="info" title="Heads up">
        Exports run in the background — we email you when the file is ready.
      </Callout>
      <Callout variant="danger" title="Card expired">
        Update the payment method before 1 October to avoid interruption.
      </Callout>
    </div>
  );
}
