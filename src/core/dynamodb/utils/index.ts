// https://dynamoosejs.com/guide/Condition
export function parseOperatorValue(value: any): Record<string, any> {
  const regex = /^([><=]+)(\d+)$/
  const match = regex.exec(value)
  const output: Record<string, any> = {}

  if (match) {
    const operator = match[1]
    const number = Number(match[2])

    switch (operator) {
      case '>':
        output.gt = number
        break
      case '>=':
        output.ge = number
        break
      case '<':
        output.lt = number
        break
      case '<=':
        output.le = number
        break
      case '=':
        output.eq = number
        break
      default:
        break
    }
  } else {
    const parsedValue = !isNaN(Number(value)) ? Number(value) : value
    output.eq = parsedValue
  }

  return output
}
