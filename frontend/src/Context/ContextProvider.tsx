import React, { Dispatch, SetStateAction, useState } from 'react'

export const Context = React.createContext<IGlobalContext>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userLoggedIn: '',
    setUserLoggedIn:()=>{}
})

interface IGlobalContext {
    isLoggedIn: boolean,
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>,
    userLoggedIn: string,
    setUserLoggedIn: Dispatch<SetStateAction<string>>
}

// @ts-ignore
const ContextProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userLoggedIn, setUserLoggedIn] = useState('')

    return <Context.Provider value={{
        isLoggedIn,
        setIsLoggedIn,
        userLoggedIn,
        setUserLoggedIn,
    }}>
        {children}
    </Context.Provider>
}

export default ContextProvider