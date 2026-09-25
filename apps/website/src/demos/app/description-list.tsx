import { Badge, DescriptionList } from "@spatika/react";

export default function Demo() {
  return (
    <DescriptionList
      className="w-full"
      items={[
        { term: "Customer", details: "Copperline Ltd." },
        { term: "Plan", details: <Badge variant="info">Scale · annual</Badge> },
        { term: "Seats", details: "48 of 60", numeric: true },
        { term: "Renews", details: "14 March 2027" },
        { term: "Account owner", details: "Maya Okafor" },
        { term: "Tax ID", details: null },
      ]}
    />
  );
}
