export function base64encode(data: any): string {
  const b = Buffer.from(data)
  return b.toString('base64')
}

export function base64decode(data: string): any {
  const b = Buffer.from(data, 'base64')
  return b.toString()
}

export function getBatches(input: number, batchSize): number[] {
  const multiples: number[] = []

  const remainder = input % batchSize
  const countOfBatches = Math.floor(input / batchSize)

  for (let i = 0; i < countOfBatches; i++) {
    multiples.push(batchSize)
  }

  if (remainder > 0) {
    multiples.push(remainder)
  }

  return multiples
}
