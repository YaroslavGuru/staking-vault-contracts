"use client";


interface InputBoxProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onAction: () => void;
  actionLabel: string;
  disabled?: boolean;
  isLoading?: boolean;
  maxValue?: string;
  onMaxClick?: () => void;
}

export default function InputBox({
  label,
  placeholder = "0.0",
  value,
  onChange,
  onAction,
  actionLabel,
  disabled = false,
  isLoading = false,
  maxValue,
  onMaxClick,
}: InputBoxProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              // Allow only numbers and decimal point
              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                onChange(val);
              }
            }}
            disabled={disabled || isLoading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {maxValue && onMaxClick && (
            <button
              type="button"
              onClick={onMaxClick}
              disabled={disabled || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
            >
              MAX
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled || isLoading || !value || parseFloat(value) <= 0}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 min-w-[120px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            actionLabel
          )}
        </button>
      </div>
    </div>
  );
}

