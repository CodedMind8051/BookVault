class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        ShowToUser = false,
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors
        this.ShowToUser = ShowToUser

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export { ApiError }