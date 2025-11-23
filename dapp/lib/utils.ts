import { formatEther, parseEther } from "viem";

/**
 * Format a bigint value to a human-readable string with decimals
 */
export function formatTokenAmount(amount: bigint | undefined, decimals: number = 18): string {
  if (!amount) return "0";
  try {
    return formatEther(amount);
  } catch {
    return "0";
  }
}

/**
 * Parse a string amount to bigint (wei)
 */
export function parseTokenAmount(amount: string): bigint {
  try {
    return parseEther(amount);
  } catch {
    return 0n;
  }
}

/**
 * Format address to short version (0x1234...5678)
 */
export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Truncate number to specified decimal places
 */
export function truncateDecimals(value: string, decimals: number = 4): string {
  const parts = value.split(".");
  if (parts.length === 1) return value;
  return `${parts[0]}.${parts[1].slice(0, decimals)}`;
}

