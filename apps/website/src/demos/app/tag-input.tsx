import { FormField, TagInput } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [emails, setEmails] = useState(["maya@kasho.app"]);
  return (
    <FormField
      label="Invite teammates"
      description="Press Enter or comma after each address. Paste a list to add several."
      className="w-full max-w-md"
    >
      <TagInput
        value={emails}
        onValueChange={setEmails}
        max={10}
        placeholder="name@company.com"
        validate={(email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || `${email} is not an email address`}
      />
    </FormField>
  );
}
