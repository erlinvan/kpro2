import { useState, useEffect, useContext } from 'react'
import { Context } from '../Context/ContextProvider'


const useFetch = <T extends any>(endpoint: string) => {
    const [response, setResponse] = useState<T>()
    const [error, setError] = useState('')
    const context = useContext(Context)

    useEffect(() => {
        let isSubscribed = true
        // Send all requests as superuser until we create concepts of users in frontend
        const data = {
            headers: {
                'X-username': context.userLoggedIn,
            },
        }
        const fetchData = async () => {
            try {
                const res = await fetch(`${apiUrl}/${endpoint}`, data)
                if (!res.ok) {
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
    }, [endpoint])

    return { response, error }
}

export const apiUrl = 'http://api.trckpck.theodorc.no'

export default useFetch
