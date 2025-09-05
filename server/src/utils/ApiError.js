class ErrorResponse extends Error {
    constructor(
        status,
        message = 'Something went wrong!',
        errors = [],
        stack = ''
    ){
        super(message)
        this.status = status
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

function ApiError(status, message, errors, stack){
    return new ErrorResponse(status, message, errors, stack)
}

export default ApiError;