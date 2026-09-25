import { Button, PhotoViewer } from "@spatika/react";
import { useState } from "react";

const photos = [
  { src: "/og.png", alt: "Spatika preview", caption: "Mukta theme" },
  { src: "/favicon.svg", alt: "Spatika mark", caption: "Rangoli mark" },
];

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open gallery
      </Button>
      <PhotoViewer open={open} onOpenChange={setOpen} items={photos} />
    </>
  );
}
