import axios from "axios"
import { setHeader } from "./setHeader"


const BASE_URL = import.meta.env.VITE_API_BASE_URL

const API = async ( method, endpoint, body = null, customHeaders = {}) =>{
    try {
        const config = {
            method: method.toLowerCase(),
            url: `${BASE_URL}/${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...setHeader(),
                ...customHeaders
            },
            data:body
        }

        const response = await axios(config)
        return response;

    } catch (error) {
        console.log("API Error", error)
        throw error
    }
}


export default API
