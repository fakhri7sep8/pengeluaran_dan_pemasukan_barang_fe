
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type SearchableSelectProps = {
    label: string;
    value: string;
    setValue: (val: string) => void;
    options: string[];
  };
 export const SearchableSelect = ({
    label,
    value,
    setValue,
    options,
  }: SearchableSelectProps) => {
    return (
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full px-3 py-2 border rounded-lg text-left">
              {value || `Pilih ${label}`}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Cari ${label}...`} />
              <CommandList>
                <CommandEmpty>Tidak ada {label}</CommandEmpty>
                {options.map((opt) => (
                  <CommandItem key={opt} onSelect={() => setValue(opt)}>
                    {opt}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };