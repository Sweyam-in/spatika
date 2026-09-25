import { Button, FormErrorSummary, FormField, Input, type FormError } from "@spatika/react";
import { useState, type FormEvent } from "react";

export default function Demo() {
  const [errors, setErrors] = useState<FormError[]>([]);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: FormError[] = [];
    if (!data.get("name")) next.push({ fieldId: "summary-name", message: "Enter your name" });
    if (!String(data.get("email")).includes("@")) next.push({ fieldId: "summary-email", message: "Enter an email address" });
    setErrors(next);
  };
  const errorFor = (id: string) => errors.find((error) => error.fieldId === id)?.message as string | undefined;
  return (
    <form noValidate onSubmit={onSubmit} className="grid w-full max-w-md gap-4">
      <FormErrorSummary errors={errors} />
      <FormField id="summary-name" label="Name" error={errorFor("summary-name")}>
        <Input name="name" />
      </FormField>
      <FormField id="summary-email" label="Email" error={errorFor("summary-email")}>
        <Input name="email" type="email" />
      </FormField>
      <Button type="submit" className="justify-self-start">
        Create account
      </Button>
    </form>
  );
}
