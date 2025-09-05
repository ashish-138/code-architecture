import {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    password:{
        type: String,
        required: true,
    },
    image:{
        type: String,
    },
    refreshToken:{
        type: String,
    }
},{
    timestamps:true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    
    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


export const User = model("User", userSchema)