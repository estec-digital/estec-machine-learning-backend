export function base64encode(data: any): string {
  const b = Buffer.from(data)
  return b.toString('base64')
}

export function base64decode(data: string): any {
  const b = Buffer.from(data, 'base64')
  return b.toString()
}
