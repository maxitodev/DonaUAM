import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const useRedirectIfAuthenticated = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem('token')
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [navigate])
}

export default useRedirectIfAuthenticated
