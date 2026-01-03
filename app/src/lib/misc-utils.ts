export function downloadBlob(blobUrl: string, fileName: string) {
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function formatAmount(
  amount: number | null | undefined,
  decimals = 2,
): string {
  if (amount == null) return ""
  const sign = amount < 0 ? "-" : ""
  let result =
    sign +
    Math.abs((amount / Math.pow(10, decimals)) >> 0)
      .toString()
      .padStart(1, "0")
  if (decimals != 0)
    result +=
      "," +
      Math.abs(amount % Math.pow(10, decimals))
        .toString()
        .padStart(decimals, "0")
  return result
}

export function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
