import {
  Button,
  FormField,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@spatika/react";

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Edit customer</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit customer</SheetTitle>
          <SheetDescription>Changes apply to every open invoice.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 p-5">
          <FormField label="Company">
            <Input defaultValue="Copperline" />
          </FormField>
          <FormField label="Billing email">
            <Input type="email" defaultValue="ap@copperline.io" />
          </FormField>
        </div>
        <SheetFooter>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
