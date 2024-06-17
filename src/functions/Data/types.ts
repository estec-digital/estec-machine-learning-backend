type TRawDB_Action = 'raw_db__insert_data' | 'raw_db__get_data' | 'raw_db__query_data'
type TAppDB_Action = 'app_db__get_data' | 'app_db__query_data' | 'app_db__get_data_for_dashboard'
type TS3_Action = 'logs__get_upload_url'
type Factory_Action = 'threshold__get_data' | 'threshold__update_data' | 'threshold__toggle_enable_alert'
type Feedback_Action = 'feedback__get_feedback_ticket' | 'feedback__save_feedback' | 'feedback_get_list' | 'feedback_get_item'
type Issue_Action = 'issue__update_acknowledge' | 'issue_get_list'

export type TAllowAction = TRawDB_Action | TAppDB_Action | TS3_Action | Factory_Action | Feedback_Action | Issue_Action
