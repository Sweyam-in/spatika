import { AspectRatio } from "@spatika/react";

export default function Demo() {
  return (
    <AspectRatio ratio={16 / 9} className="w-full max-w-md rounded-[var(--spk-radius-md)] bg-surface-sunken">
      <img src="/og.png" alt="Spatika UI preview" loading="lazy" />
    </AspectRatio>
  );
}
