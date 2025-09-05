class Response {
    constructor(
        status,
        data,
        message='Success',
        extra = {}
    ){
        this.status = status
        this.data = data
        this.message = message
        this.success = status < 400

        Object.assign(this, extra)
    }
}

function ApiResponse(status, data, message, extra = {}){
    return new Response(status, data, message, extra)
}

export default ApiResponse;