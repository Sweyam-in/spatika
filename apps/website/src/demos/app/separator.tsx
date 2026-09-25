import { Separator } from "@spatika/react";

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-3 text-body-sm">
      <p>Account</p>
      <Separator />
      <div className="flex h-5 items-center gap-3">
        <span>Profile</span>
        <Separator orientation="vertical" />
        <span>Billing</span>
        <Separator orientation="vertical" />
        <span>Security</span>
      </div>
    </div>
  );
}
