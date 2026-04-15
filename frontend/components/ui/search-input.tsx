import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, placeholder = "Search", ...rest }, ref) {
    return (
      <div
        className={clsx(
          "flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)]",
          "bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]",
          "focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]",
          className,
        )}
      >
        <Search className="h-4 w-4 text-[var(--color-text-3)]" aria-hidden />
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)]"
          {...rest}
        />
      </div>
    );
  },
);
