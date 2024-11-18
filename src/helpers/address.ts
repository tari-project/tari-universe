export function shortenSubstateAddress(input: string, startChars = 5, endChars = 5): string {
  // example address string: component_3636be07822720b55b6053769d91af4af959c12bd17187c3673716e09a4ebe33
  const parts = input.split("_")

  // Check if the input has the expected format
  if (parts.length < 2) {
    return input
  }

  const prefix = parts[0] // SubstateId
  const longString = parts[1] // Address

  // Ensure the long string is long enough to shorten
  if (longString.length <= startChars + endChars) {
    return input
  }

  const startPart = longString.substring(0, startChars)
  const endPart = longString.substring(longString.length - endChars)

  return `${prefix}_${startPart}(...)${endPart}`
}
