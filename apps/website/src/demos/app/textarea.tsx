import { FormField, Textarea } from "@spatika/react";

export default function Demo() {
  return (
    <FormField label="Release notes" description="Markdown is supported." className="w-full max-w-md">
      <Textarea rows={4} placeholder="What changed in this release?" />
    </FormField>
  );
}
