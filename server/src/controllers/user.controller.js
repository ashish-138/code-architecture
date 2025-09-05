import { User } from '../models/user.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'




const registerUser = asyncHandler(async(req,res)=>{
    const { name, email, password} = req.body

    if(
        [name, email, password].some((field)=>field?.trim() === "")
    ){
        throw ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({email})

    if(existingUser) {
        throw ApiError(409, "User is already registered")
    }

    const imagePath = req.files?.image[0]?.path

    if(!imagePath) {
        throw ApiError(400, "Image is required!")
    }

    const user = await User.create({
        name,
        email,
        password,
        imagePath
    }) 

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200).json(
        ApiResponse(201, createdUser, "User registered Successfully")
    )
    
})



export { registerUser }