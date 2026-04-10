"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MultiSelectProps {
  label?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih...",
}: MultiSelectProps) {
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-black">{label}</label>}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-h-10 px-3 text-sm flex items-center justify-between gap-2",
              value.length === 0 && "text-gray-400 font-normal",
            )}
          >
            {value.length ? (
              <span className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
                {value.join(", ")}
              </span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="
            w-(--radix-popover-trigger-width)
            max-w-(--radix-popover-trigger-width)
            p-3 rounded-xl shadow-md
            overflow-hidden
          "
        >
          <Input
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 h-9"
          />
          
          <div className="max-h-48 overflow-y-auto overflow-x-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-max space-y-1 pr-2">
                {filteredOptions.length ? (
                  filteredOptions.map((opt) => {
                    const checked = value.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleValue(opt)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          checked
                            ? "bg-green-50 text-green-700"
                            : "hover:bg-gray-50 text-gray-700",
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0 text-green-600",
                            checked ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="whitespace-nowrap">{opt}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">
                    Data tidak ditemukan
                  </p>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
