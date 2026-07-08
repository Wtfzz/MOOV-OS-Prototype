export const BLANK_FILTER_VALUE = "__blank__";

export type ColumnFilter<T> = {
  key: string;
  label: string;
  getValue: (row: T) => string | number | boolean | null | undefined;
};

export type ColumnFilterState = Record<string, string[] | undefined>;

export type ColumnFilterOption = {
  value: string;
  label: string;
};

export function normalizeFilterValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return BLANK_FILTER_VALUE;
  }
  return String(value);
}

export function getFilterOptions<T>(
  rows: T[],
  column: ColumnFilter<T>,
  blankLabel: string
): ColumnFilterOption[] {
  const values = new Map<string, string>();

  rows.forEach((row) => {
    const rawValue = column.getValue(row);
    const normalizedValue = normalizeFilterValue(rawValue);
    const displayValue = normalizedValue === BLANK_FILTER_VALUE ? blankLabel : String(rawValue);
    values.set(normalizedValue, displayValue);
  });

  return Array.from(values, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export function applyColumnFilters<T>(
  rows: T[],
  columns: ColumnFilter<T>[],
  filters: ColumnFilterState
) {
  return rows.filter((row) =>
    columns.every((column) => {
      const selectedValues = filters[column.key];
      if (!selectedValues) {
        return true;
      }
      return selectedValues.includes(normalizeFilterValue(column.getValue(row)));
    })
  );
}
