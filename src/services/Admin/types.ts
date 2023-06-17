export interface IInitDataToDB {}

export interface IInitDataToDBResponse {
  message: string
}

export interface IReadCSVFile<RowType> {
  file: string
  onData?: (data: RowType) => void
  onEnd?: () => void
}

export interface IFile_DemoData {
  Date: string
  Time: string
  Pyrometer: string
  NOx_GA01: string
  Oxi_GA01: string
  Kiln_inlet_temp: string
  Prediction: string
}

export interface IFile_LabelDescription {
  Label: string
  Status: string
  Description: string
}
