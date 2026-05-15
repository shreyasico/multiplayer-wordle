"use client";

import { useTheme } from "./ThemeProvider";

interface WordLengthPickerProps {
  value: number;
  onChange: (len: number) => void;
  disabled: boolean;
}

const LENGTHS = [5, 6, 7, 8, 9, 10, 11, 12];

export default function WordLengthPicker({
  value,
  onChange,
  disabled,
}: WordLengthPickerProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Word Length</p>
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2 w-full">
        {LENGTHS.map((len) => {
          const isActive = value === len;
          return (
            <button
              key={len}
              onClick={() => !disabled && onChange(len)}
              disabled={disabled}
              className={`length-btn-grid ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              style={
                isActive
                  ? {
                      backgroundColor: "#6aaa64",
                      color: "white",
                      borderColor: "#6aaa64",
                      boxShadow: "0 0 12px rgba(106, 170, 100, 0.4)",
                      transform: "scale(1.1)",
                    }
                  : {
                      backgroundColor: theme.inputBg,
                      color: theme.textMuted,
                      borderColor: theme.inputBorder,
                    }
              }
            >
              {len}
            </button>
          );
        })}
      </div>
    </div>
  );
}
