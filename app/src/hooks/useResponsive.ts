import { BreakPointHooks, breakpointsTailwind } from "@react-hooks-library/core"

const { useSmaller, useGreater } = BreakPointHooks(breakpointsTailwind)

export function useIsMobile() {
  return useSmaller("sm")
}

export function useIsTwoColumn() {
  return useGreater("lg")
}
