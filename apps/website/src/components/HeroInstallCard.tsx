import { Card, CardContent, CardHeader, CardTitle } from "@spatika/react";
import { CodeBlock } from "@/components/CodeBlock";
import { INSTALL } from "@/data/site";

const steps = [
  "Import token styles in your entry file",
  "Wrap the app with SpatikaThemeProvider",
  "Compose primitives and chrome composites",
] as const;

export function HeroInstallCard() {
  return (
    <Card surface="raised">
      <CardHeader>
        <CardTitle>Quick install</CardTitle>
      </CardHeader>
      <CardContent>
        <CodeBlock code={INSTALL.both} />
        <ol className="install-steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span className="install-step-num">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
