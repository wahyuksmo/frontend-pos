/**
 * Client-side Export Utility for POS Reports
 * Generates Excel-compatible CSV with UTF-8 Byte Order Mark (BOM).
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

export function exportToExcelCsv<T>(filename: string, columns: ExportColumn<T>[], data: T[]) {
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(";");

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const val = col.accessor(item);
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(";");
  });

  // UTF-8 BOM (\uFEFF) forces Excel to interpret as UTF-8 with semicolon delimiters
  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
