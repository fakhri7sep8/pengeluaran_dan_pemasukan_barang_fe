export interface SearchableSelectProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  options: string[];
}