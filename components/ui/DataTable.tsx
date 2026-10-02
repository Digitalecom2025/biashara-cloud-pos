import { ReactNode } from "react";

type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No records found.",
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full">

        <thead className="bg-gray-50">

          <tr>

            {columns.map((column) => (

              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-sm font-semibold"
              >
                {column.header}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {data.length === 0 ? (

            <tr>

              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>

            </tr>

          ) : (

            data.map((row, index) => (

              <tr
                key={index}
                className="border-t"
              >

                {columns.map((column) => (

                  <td
                    key={String(column.key)}
                    className="px-4 py-3"
                  >
                    {column.render
                      ? column.render(
                          row[column.key],
                          row
                        )
                      : String(
                          row[column.key] ?? ""
                        )}
                  </td>

                ))}

              </tr>

            ))

          )}

        </tbody>

      </table>
    </div>
  );
}