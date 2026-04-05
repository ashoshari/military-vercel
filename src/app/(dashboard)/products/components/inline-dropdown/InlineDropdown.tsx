import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function InlineDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "var(--accent-green)",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function useClickOutside(
    ref: React.RefObject<HTMLDivElement | null>,
    cb: () => void,
  ) {
    useEffect(() => {
      const h = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) cb();
      };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [ref, cb]);
  }

  useClickOutside(ref, () => setOpen(false));
  const display = options.find((o) => o.value === value)?.label ?? label;
  const isChanged = value !== options[0].value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isChanged
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isChanged ? accent : "var(--border-subtle)"}`,
          color: isChanged ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 160,
          }}
        >
          {display}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 180,
              overflow: "hidden",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 block"
                style={{
                  color: o.value === value ? accent : "var(--text-secondary)",
                  fontWeight: o.value === value ? 700 : 400,
                }}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
