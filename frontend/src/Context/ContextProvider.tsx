import React, { Dispatch, SetStateAction, useState } from 'react'

export const Context = React.createContext<IGlobalContext>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    trackerID: 0,
    setTrackerID: () => {},
})

interface IGlobalContext {
    isLoggedIn: boolean,
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>
    trackerID: number,
    setTrackerID: Dispatch<SetStateAction<number>>
}

// @ts-ignore
const ContextProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [trackerID, setTrackerID] = useState(0)

    return <Context.Provider value={{
        isLoggedIn,
        setIsLoggedIn,
        trackerID,
        setTrackerID,
    }}>
        {children}
    </Context.Provider>
}

export default ContextProvider