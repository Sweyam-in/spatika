import { Checkbox, Input, Label } from "@spatika/react";

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="label-demo-name">Display name</Label>
        <Input id="label-demo-name" defaultValue="Maya Okafor" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="label-demo-terms" />
        <Label htmlFor="label-demo-terms">Email me product updates</Label>
      </div>
    </div>
  );
}
