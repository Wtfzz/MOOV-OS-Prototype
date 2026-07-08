import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ColumnFilterOption } from "@/lib/columnFilters";

type ColumnFilterHeaderProps = {
  label: string;
  options: ColumnFilterOption[];
  selectedValues?: string[];
  searchPlaceholder: string;
  selectAllLabel: string;
  deselectAllLabel: string;
  noMatchesLabel: string;
  onChange: (values: string[] | undefined) => void;
};

export default function ColumnFilterHeader({
  label,
  options,
  selectedValues,
  searchPlaceholder,
  selectAllLabel,
  deselectAllLabel,
  noMatchesLabel,
  onChange,
}: ColumnFilterHeaderProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draftValues, setDraftValues] = useState<Set<string> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const committedSet = useMemo(() => new Set(selectedValues ?? options.map((option) => option.value)), [
    options,
    selectedValues,
  ]);
  const selectedSet = draftValues ?? committedSet;
  const allSelected = selectedSet.size === options.length;
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const updateSelection = (next: Set<string>) => setDraftValues(next);

  const handleToggleAll = () => {
    if (allSelected) {
      setDraftValues(new Set());
      return;
    }
    setDraftValues(new Set(options.map((option) => option.value)));
  };

  const handleToggleOption = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    updateSelection(next);
  };

  const applyVisibleSelection = () => {
    const nextValues = search.trim()
      ? filteredOptions.filter((option) => selectedSet.has(option.value)).map((option) => option.value)
      : Array.from(selectedSet);
    onChange(nextValues.length === options.length ? undefined : nextValues);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-flex min-w-full">
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setDraftValues(new Set(committedSet));
          setOpen((current) => !current);
        }}
        className="inline-flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-md border border-border bg-card p-3 text-foreground shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyVisibleSelection();
              }
            }}
            placeholder={searchPlaceholder}
            className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={handleToggleAll}
            className="mb-2 w-full rounded-md border border-input px-3 py-2 text-sm hover:bg-muted"
          >
            {allSelected ? deselectAllLabel : selectAllLabel}
          </button>
          <div className="max-h-56 overflow-y-auto pr-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">{noMatchesLabel}</div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedSet.has(option.value)}
                    onChange={() => handleToggleOption(option.value)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="truncate" title={option.label}>
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
