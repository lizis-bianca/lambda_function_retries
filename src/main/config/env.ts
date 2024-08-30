import 'dotenv/config'


export default {
    environment: (process.env.ENVIRONMENT ?? 'development'),  
    maxVisibilityTimeout: (process.env.MAX_VISIBILITY_TIMEOUT ?? 42900),
    eventBaseBackoff: (process.env.EVENT_BASE_BACKOFF ?? 5)
}