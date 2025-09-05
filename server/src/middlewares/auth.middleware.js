import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { User } from '../models/user.model.js'


const verifyToken = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw ApiError(401, "Invalid access token")
        }

        req.user = user
        next()

    } catch (error) {
        throw ApiError(401, error?.message || "Invalid access token.")
    }
})


const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw ApiError(403, "You don't have permission to access this resource")
    }
    next()
  }
}

export { verifyToken, authorizeRole} 