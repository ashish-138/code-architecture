import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute() {
    const { status } = useSelector((state)=> state.auth)
    
    if(!status){
        return <Navigate to="/" replace/>
    }
  return (
    <Outlet />
  )
}
