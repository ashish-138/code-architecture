export const setHeader = () =>{
    let auth = localStorage.getItem("auth")
    auth = JSON.parse(auth)
 
    return {
            "Authorization" : `Bearer ${auth}`
    }

}