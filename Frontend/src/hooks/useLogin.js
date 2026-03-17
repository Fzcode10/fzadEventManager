import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext.jsx';

export const useLogin = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {dispatch} = useContext(AuthContext);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/visitor/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const json = await res.json();
            // console.log(JSON.stringify(json));

            if(res.ok){
                // local storage
                localStorage.setItem("user" , JSON.stringify(json.token));

                dispatch({type: 'LOGIN', payload: json});

                setLoading(false);
            }else{
                setLoading(false);
                throw Error(json.error)
            }

        }catch (error) {
            setError(error.message);
            console.log(error.message);
        }

    }

    return {login, error, loading, setError};
}