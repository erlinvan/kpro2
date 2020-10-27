import { useState, useEffect, useContext } from 'react'
import { Context } from '../Context/ContextProvider'
import { useHistory } from 'react-router-dom'


const useFetch = <T extends any>(endpoint: string) => {
    const [response, setResponse] = useState<T>()
    const [error, setError] = useState('')
    const context = useContext(Context)
    const history = useHistory()

    useEffect(() => {
        let isSubscribed = true
        // Send all requests as superuser until we create concepts of users in frontend
        const data = {
            headers: {
                'X-username': context.userName,
            },
        }
        const fetchData = async () => {
            try {
                const res = await fetch(`${apiUrl}/${endpoint}`, data)
                if (!res.ok) {
                    // Since authentication is not implemented, 403 while logged in is true is the result of invalid username
                    if (res.status ===403 && context.isLoggedIn){
                        context.setWarning('Invalid username')
                    }
                    context.setUserName('')
                    context.setIsLoggedIn(false)
                    history.push('login')
                    throw new Error(`${res.status} ${res.statusText}`)
                }
                const json = await res.json()
                if (!isSubscribed) {
                    return
                }
                setResponse(json)
            } catch (error) {
                setError(error.message)
            }
        }

        fetchData()
        return () => {
            isSubscribed = false
        }
    }, [endpoint, context.userName, history, context])

    return { response, error }
}

export const apiUrl = 'https://api2.trckpck.theodorc.no'

export default useFetch
