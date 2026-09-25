import type { ComponentType, ReactNode } from "react";

/**
 * Live demos for the app catalog — one file per component in `./app`. The same files feed
 * `generated/demo-sources.json`, so the code shown under each preview is the code that ran.
 */
const modules = import.meta.glob<{ default: ComponentType }>("./app/*.tsx", { eager: true });

export const appDemos: Record<string, ReactNode> = Object.fromEntries(
  Object.entries(modules).map(([file, module]) => {
    const slug = file.replace("./app/", "").replace(/\.tsx$/, "");
    const Demo = module.default;
    return [slug, <Demo key={slug} />];
  }),
);
