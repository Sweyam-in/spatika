import { TreeView, type TreeViewNode } from "@spatika/react";
import { FileCode2, FileText, Folder } from "lucide-react";

const files: TreeViewNode[] = [
  {
    id: "src",
    label: "src",
    icon: <Folder />,
    children: [
      { id: "app", label: "App.tsx", icon: <FileCode2 />, meta: "4 KB" },
      {
        id: "components",
        label: "components",
        icon: <Folder />,
        children: [
          { id: "invoice", label: "InvoiceTable.tsx", icon: <FileCode2 />, meta: "12 KB" },
          { id: "summary", label: "Summary.tsx", icon: <FileCode2 />, meta: "3 KB" },
        ],
      },
    ],
  },
  { id: "readme", label: "README.md", icon: <FileText />, meta: "2 KB" },
];

export default function Demo() {
  return (
    <TreeView
      aria-label="Project files"
      items={files}
      defaultExpanded={["src"]}
      defaultSelected="app"
      className="w-full max-w-sm"
    />
  );
}
