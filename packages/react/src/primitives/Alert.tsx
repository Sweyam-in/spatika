import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, Sparkles } from "lucide-react";
import { cn } from "../lib/cn";

const alertVariants = cva("spk-alert", {
  variants: {
    variant: {
      default: "",
      info: "",
      success: "",
      warning: "",
      danger: "",
      accent: "",
      /** 1.x alias of `warning`. */
      warm: "",
      /** 1.x alias of `accent`. */
      highlight: "",
    },
  },
  defaultVariants: { variant: "default" },
});

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const toneOf: Record<AlertVariant, string | undefined> = {
  default: undefined,
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
  accent: "accent",
  warm: "warning",
  highlight: "accent",
};

const defaultIcon: Partial<Record<string, React.ReactNode>> = {
  info: <Info aria-hidden />,
  success: <CheckCircle2 aria-hidden />,
  warning: <AlertTriangle aria-hidden />,
  danger: <OctagonAlert aria-hidden />,
  accent: <Sparkles aria-hidden />,
};

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Leading icon. Tones get a default icon so status is not conveyed by colour alone; pass `null` to hide. */
    icon?: React.ReactNode;
    /** Trailing action (button, close). */
    action?: React.ReactNode;
  };

function Alert({ className, variant, icon, action, children, role, ...props }: AlertProps) {
  const tone = toneOf[variant ?? "default"];
  const resolvedIcon = icon === undefined ? (tone ? defaultIcon[tone] : null) : icon;
  return (
    <div
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      data-slot="alert"
      data-tone={tone}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {resolvedIcon ? <span className="spk-alert-icon">{resolvedIcon}</span> : null}
      <div className="spk-alert-body">{children}</div>
      {action ? <div className="-my-1 flex shrink-0 items-center gap-1.5 self-start">{action}</div> : null}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5 data-slot="alert-title" className={cn("text-body font-medium leading-snug text-fg", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-body-sm text-fg-secondary [[data-slot=alert-title]+&]:mt-0.5", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps };
