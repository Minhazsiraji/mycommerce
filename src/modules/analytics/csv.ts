export function csvCell(value: string | number | null | undefined): string {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function csvRow(values: Array<string | number | null | undefined>): string {
  return values.map(csvCell).join(',')
}
