import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClassValue } from "clsx"
import type { CoValue, MaybeLoaded } from "jazz-tools"

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function isLoaded<T extends CoValue>(item: MaybeLoaded<T>): item is T {
  return item.$isLoaded === true
}
