 const errorHandler = (err, _, res, next) => {
    const statusCode = err.status || 500;

    console.log("Error",err.stack)

    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        errors: err.errors || [],
        data: null,
        
    });
};


export default errorHandler
