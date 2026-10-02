import { ReactNode } from "react";

import Card from "./Card";

type Props = {
  title: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  children,
}: Props) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">
        {title}
      </h2>

      {children}
    </Card>
  );
}