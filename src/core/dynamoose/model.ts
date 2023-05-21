export async function executeConcurrently<T>(items: T[], maxSize: number = 25, callback: (items: T[]) => Promise<void>) {
  const partitions = Array.from({ length: Math.ceil(items.length / maxSize) }, (_, i) => items.slice(i * maxSize, (i + 1) * maxSize))
  for (const partition of partitions) {
    await callback(partition)
  }
}
