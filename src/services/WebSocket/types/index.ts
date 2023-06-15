interface IPostDataGeneric {
  data: object
}
interface IPostDataToAllConnections extends IPostDataGeneric {
  type: 'POST_TO_ALL_CONNECTIONS'
}

interface IPostDataToSingleConnection extends IPostDataGeneric {
  type: 'POST_TO_SINGLE_CONNECTION'
  connectionId: string
}

export type TPostData = IPostDataToAllConnections | IPostDataToSingleConnection
