import React, { Dispatch, SetStateAction, useState } from 'react'

export const Context = React.createContext<IGlobalContext>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
})

interface IGlobalContext {
    isLoggedIn: boolean,
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

// @ts-ignore
const ContextProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    return <Context.Provider value={{
        isLoggedIn,
        setIsLoggedIn,
    }}>
        {children}
    </Context.Provider>
}

export default ContextProvider