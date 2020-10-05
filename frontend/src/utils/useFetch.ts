import { useState, useEffect } from 'react'

const useFetch = <T extends any>(endpoint: string) => {
    const [response, setResponse] = useState<T>()
    const [error, setError] = useState('')

    useEffect(() => {
        let isSubscribed = true
        const fetchData = async () => {
            try {
                const res = await fetch(`${apiUrl}/${endpoint}`)
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
