import React from "react";

// 使用泛型定义表格的 props
interface SortableTableProps<T extends Record<string, unknown>> {
  headers: { key: keyof T; label: string }[];
  data: T[];
}

const SortableTable = <T extends Record<string, unknown>>({
  headers,
  data,
}: SortableTableProps<T>) => {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          {headers.map((header) => (
            <th
              key={String(header.key)}
              style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
            {headers.map((header) => (
              <td key={String(header.key)} style={{ border: "1px solid #ddd", padding: "8px" }}>
                {String(row[header.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SortableTable;
