import { Sparkles } from "lucide-react";
import { cn } from "../lib/cn";

type AiOverlayProps = {
  visible: boolean;
  className?: string;
};

export function AiOverlay({ visible, className }: AiOverlayProps) {
  if (!visible) return null;

  return (
    <div className={cn("spk-editor-ai-overlay", className)} aria-hidden="true">
      <Sparkles className="spk-editor-ai-overlay-icon size-5" />
      <span>AI is working…</span>
    </div>
  );
}
