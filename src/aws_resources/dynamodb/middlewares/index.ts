type SensorDataPartial = {
  FactoryId_Date: string // Partition key: F_aBc1D::2023-07-30
  Time: string // Sort key: 19:35:18
  Date: string
  FactoryId: string // F_aBc1D
}
export function constraintChecking__SensorData(tableName: string, obj: SensorDataPartial) {
  if (!obj.FactoryId_Date && obj.FactoryId && obj.Date) {
    obj.FactoryId_Date = getPartitionKey_SensorData(obj)
  }

  if ([obj.FactoryId_Date, obj.Date, obj.Time, obj.FactoryId].every((val) => val !== undefined) === false) {
    console.log(`Missing data for ${tableName}: `, obj)
    throw new Error(`Missing data for ${tableName}: ` + JSON.stringify(obj))
  }
  if (obj.FactoryId_Date !== `${obj.FactoryId}::${obj.Date}`) {
    console.log(`Invalid key for ${tableName}: `, obj)
    throw new Error(`Invalid key for ${tableName}: ` + JSON.stringify(obj))
  }
}

export function getPartitionKey_SensorData(params: { FactoryId: string; Date: string }) {
  return `${params.FactoryId}::${params.Date}`
}
