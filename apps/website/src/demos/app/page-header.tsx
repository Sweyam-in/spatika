import { Breadcrumb, Button, PageHeader } from "@spatika/react";
import { Plus } from "lucide-react";

export default function Demo() {
  return (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: "Billing", href: "#" }, { label: "Invoices" }]} />}
      title="Invoices"
      description="Everything you have billed this quarter."
      actions={<Button leadingIcon={<Plus className="size-4" />}>New invoice</Button>}
      bordered
    />
  );
}
