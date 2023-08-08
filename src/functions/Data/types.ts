type TRawDB_Action = 'raw_db__insert_data' | 'raw_db__get_data' | 'raw_db__query_data'
type TAppDB_Action = 'app_db__get_data' | 'app_db__query_data' | 'app_db__add_feedback'

export type TAllowAction = TRawDB_Action | TAppDB_Action
