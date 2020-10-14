import { useState, useEffect } from 'react'

const useFetch = <T extends any>(endpoint: string) => {
    const [response, setResponse] = useState<T>()
    const [error, setError] = useState('')

    useEffect(() => {
        let isSubscribed = true
        // Send all requests as superuser until we create concepts of users in frontend
        const data = {
            headers: {
                'X-username': 'superuser',
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

export const apiUrl = 'https://api.trckpck.theodorc.no'

export default useFetch
