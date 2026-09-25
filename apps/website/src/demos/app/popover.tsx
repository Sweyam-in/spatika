import { Button, FormField, Input, Popover, PopoverContent, PopoverTrigger } from "@spatika/react";
import { SlidersHorizontal } from "lucide-react";

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" leadingIcon={<SlidersHorizontal className="size-4" />}>
          Dimensions
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions" className="grid gap-3">
        <FormField label="Width">
          <Input defaultValue="1280" inputMode="numeric" />
        </FormField>
        <FormField label="Height">
          <Input defaultValue="800" inputMode="numeric" />
        </FormField>
      </PopoverContent>
    </Popover>
  );
}
