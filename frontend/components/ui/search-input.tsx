import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.form-input-icon` + `.form-input` pattern with a
 * leading search icon. The prototype CSS handles icon positioning (8px from
 * left) and input padding (36px). Do not override those inline.
 */
export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, placeholder = "Search", ...rest }, ref) {
    return (
      <div className="form-input-icon" style={{ flex: 1, minWidth: 200 }}>
        <Search
          className="icon-left"
          size={16}
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={clsx("form-input", className)}
          {...rest}
        />
      </div>
    );
  },
);
