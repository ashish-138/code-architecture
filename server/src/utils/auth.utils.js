import jwt from 'jsonwebtoken'

const generateAccessToken = (data) =>{
    return jwt.sign(
        data,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshToken = (data) =>{
    return jwt.sign(
        data,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export { generateAccessToken, generateRefreshToken}