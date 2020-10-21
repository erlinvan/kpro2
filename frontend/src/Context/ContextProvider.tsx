import React, { Dispatch, SetStateAction, useState } from 'react'

export const Context = React.createContext<IGlobalContext>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userName: '',
    setUserName: () => {},
    trackerID: 0,
    setTrackerID: () => {},
    warning: '',
    setWarning: () => {},
})

interface IGlobalContext {
    isLoggedIn: boolean
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>
    userName: string
    setUserName: Dispatch<SetStateAction<string>>
    trackerID: number
    setTrackerID: Dispatch<SetStateAction<number>>
    warning: string
    setWarning: Dispatch<SetStateAction<string>>
}

// @ts-ignore
const ContextProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userName, setUserName] = useState('')
    const [trackerID, setTrackerID] = useState(0)
    const [warning, setWarning] = useState('')

    return (
        <Context.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                userName,
                setUserName,
                trackerID,
                setTrackerID,
                warning,
                setWarning,
            }}
        >
            {children}
        </Context.Provider>
    )
}

export default ContextProvider
