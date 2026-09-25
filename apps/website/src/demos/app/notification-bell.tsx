import { NotificationBell, type NotificationItem } from "@spatika/react";
import { useState } from "react";

const initial: NotificationItem[] = [
  { id: "1", title: "Copperline paid INV-2041", body: "$1,250.00", createdAtLabel: "2m ago" },
  { id: "2", title: "Export ready", body: "Transactions, Q3", createdAtLabel: "1h ago", isRead: true },
];

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initial);
  return (
    <NotificationBell
      open={open}
      onOpenChange={setOpen}
      items={items}
      unreadCount={items.filter((item) => !item.isRead).length}
      onMarkAll={() => setItems(items.map((item) => ({ ...item, isRead: true })))}
    />
  );
}
