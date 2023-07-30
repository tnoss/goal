import { Button, TextField } from '@mui/material'
import { useState } from 'react'
import { useLocalAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { SkeletonLoading } from '../components/SkeletonLoading'

const Login = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const auth = useLocalAuth()
    const [loading, setLoading] = useState(false)

    const [user, setUser] = useState<{ email?: string, password?: string }>({
        email: 'admin@goal.com',
        password: 'admin'
    })

    async function handleSignIn() {
        setLoading(true)
        const from = location.state?.from?.pathname || "/"
        if (user) {
            auth.signin(user.email!, user.password!, (error?: string) => {
                if (!error) {
                    navigate(from, { replace: true })
                }
                setLoading(false)
            })
        }
    }

    const handleChange = (e: any) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    if (auth.checkIfUserLoggedIn()) {
        const from = location.state?.from?.pathname || "/"
        navigate(from, { replace: true })
        return
    }

    return (
        <div className='tw-w-screen tw-h-screen tw-flex tw-flex-col tw-items-center tw-py-60 tw-gap-10'>
            <h3 className='tw-text-4xl'>Login | Welcome to GOAL</h3>
            {loading ? (
                <div className='tw-w-[500px] tw-flex tw-flex-col tw-gap-3'>
                    <SkeletonLoading number={4} />
                </div>
            ) : (
                <div className='tw-w-[500px] tw-flex tw-flex-col tw-gap-3'>
                    <TextField variant='outlined' name='email' onChange={handleChange} placeholder='User Name/Email' />
                    <TextField variant='outlined' type='password' name='password' onChange={handleChange} placeholder='Password' />
                    <Button variant='outlined' size='large' onClick={handleSignIn}>Login</Button>
                    <Button variant='outlined' size='large' onClick={() => navigate('/register')}>Create an Account</Button>
                </div>
            )}
        </div>
    )
}

export default Login