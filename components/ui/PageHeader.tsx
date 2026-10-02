import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  actions,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div>
          {actions}
        </div>
      )}

    </div>
  );
}