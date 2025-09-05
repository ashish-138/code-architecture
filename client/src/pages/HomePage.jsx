import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/features/authSlice'
import { setTitle } from '../utils/setTitle'

export default function HomePage() {

    const { status, userData } = useSelector((state)=>state.auth) // for getting data from store
    //or const userData = useSelector((state)=>state.auth.userData)

    console.log(status)

    const dispatch = useDispatch()

    // dispatch(login(userData)) // to send data


    useEffect(()=>{
        setTitle("Home || App")
    },[])

  return (
    <div>HomePage</div>
  )
}
