import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  (
    {
      id,
      label,
      helperText,
      placeholder,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-2">
        {label ? (
          <label
            htmlFor={selectId}
            className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-500"
          >
            {label}
          </label>
        ) : null}

        <div className="group/select relative">
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-blue-500/18 via-blue-500/4 to-transparent opacity-0 transition-opacity duration-200 group-hover/select:opacity-60 group-focus-within/select:opacity-100" />

          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-describedby={helperId}
            {...props}
            className={`relative z-[1] w-full appearance-none rounded-2xl border border-zinc-700/60 bg-zinc-950/80 px-4 py-3 pr-12 text-sm font-medium text-zinc-100 shadow-[0_26px_70px_-45px_rgba(59,130,246,0.55)] transition-all duration-200 ease-out focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:border-zinc-600/70 disabled:cursor-not-allowed disabled:border-zinc-800/70 disabled:bg-zinc-900/60 disabled:text-zinc-500 ${className}`}
          >
            {placeholder !== undefined ? (
              <option value="">
                {placeholder}
              </option>
            ) : null}
            {children}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors duration-200 group-hover/select:text-blue-200 group-focus-within/select:text-blue-200" />
        </div>

        {helperText ? (
          <p id={helperId} className="text-xs text-zinc-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
