import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Button,
  FormField,
  Input,
  NumberInput,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  THEME_IDS,
  THEME_LABELS,
  type ThemeId,
} from "@spatika/react";
import { CodeBlock } from "@/components/CodeBlock";
import {
  controlsFor,
  playgroundCode,
  type PlaygroundConfig,
  type PlaygroundProps,
} from "@/docs/playground";

const WIDTHS = [
  { value: "full", label: "Full", width: "100%" },
  { value: "tablet", label: "768", width: "768px" },
  { value: "phone", label: "375", width: "375px" },
] as const;

type WidthId = (typeof WIDTHS)[number]["value"];

/**
 * Live props playground. The preview renders the real component from `@spatika/react`; controls
 * come from the generated API, so they only offer values the installed version accepts. The
 * theme is scoped to the preview; widths resize the preview container, which is what
 * container-query components respond to (viewport media queries follow the browser window).
 */
export function Playground({ config }: { config: PlaygroundConfig }) {
  const [props, setProps] = useState<PlaygroundProps>(config.initial);
  const [theme, setTheme] = useState<ThemeId>("mukta");
  const [width, setWidth] = useState<WidthId>("full");
  const [resetKey, setResetKey] = useState(0);
  const controls = useMemo(() => controlsFor(config), [config]);
  const Component = config.component;
  const code = playgroundCode(config, props);
  const set = (name: string, value: PlaygroundProps[string]) => setProps((prev) => ({ ...prev, [name]: value }));
  const { children, ...rest } = props;

  return (
    <div className="playground" data-slot="playground">
      <div className="playground-stage">
        <div className="playground-toolbar">
          <SegmentedControl<WidthId>
            aria-label="Preview width"
            size="sm"
            value={width}
            onChange={setWidth}
            options={WIDTHS.map((item) => ({ value: item.value, label: item.label }))}
          />
          <Select value={theme} onValueChange={(value) => setTheme(value as ThemeId)}>
            <SelectTrigger size="sm" aria-label="Preview theme" className="playground-theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {THEME_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<RotateCcw className="size-3.5" aria-hidden />}
            onClick={() => {
              setProps(config.initial);
              setTheme("mukta");
              setWidth("full");
              setResetKey((key) => key + 1);
            }}
          >
            Reset
          </Button>
        </div>
        <div className="playground-canvas">
          <div
            className={`playground-frame ${theme}`}
            data-theme-preview={theme}
            style={{ maxWidth: WIDTHS.find((item) => item.value === width)?.width }}
          >
            <div style={{ width: config.width ?? "auto", maxWidth: "100%" }}>
              {/* Remount on reset so uncontrolled defaults (defaultChecked, defaultValue) apply again. */}
              <Component key={resetKey} {...rest}>
                {children === undefined || children === "" ? undefined : String(children)}
              </Component>
            </div>
          </div>
        </div>
      </div>

      <form className="playground-controls" aria-label="Props" onSubmit={(event) => event.preventDefault()}>
        {controls.map((control) => {
          const id = `pg-${config.exportName}-${control.name}`;
          const value = props[control.name];
          if (control.kind === "boolean") {
            return (
              <label key={control.name} className="playground-switch" htmlFor={id}>
                <code>{control.name}</code>
                <Switch id={id} size="sm" checked={value === true} onCheckedChange={(checked) => set(control.name, checked)} />
              </label>
            );
          }
          if (control.kind === "select") {
            return (
              <FormField key={control.name} id={id} label={control.name}>
                <Select value={typeof value === "string" ? value : control.options[0]} onValueChange={(next) => set(control.name, next)}>
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {control.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            );
          }
          if (control.kind === "number") {
            return (
              <FormField key={control.name} id={id} label={control.name}>
                <NumberInput
                  size="sm"
                  value={typeof value === "number" ? value : null}
                  onValueChange={(next) => set(control.name, next ?? undefined)}
                />
              </FormField>
            );
          }
          return (
            <FormField key={control.name} id={id} label={control.name}>
              <Input size="sm" value={typeof value === "string" ? value : ""} onChange={(event) => set(control.name, event.target.value)} />
            </FormField>
          );
        })}
      </form>

      <CodeBlock language="tsx" code={code} />
    </div>
  );
}
