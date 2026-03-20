import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

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
            console.log(JSON.stringify(json));

            // const userRole = json.role;
            // const userName = json.name;
            // const userToken = JSON.stringify(json.token);

            // const userDetials = {
            //     role: json.role,
            //     name : json.name,
            //     token: json.token
            // }

            if(res.ok){
                // local storage
                localStorage.setItem("user" , JSON.stringify(json.token));
                localStorage.setItem( "userDetails", JSON.stringify({ name:json.name,role: json.role, token: json.token }));

                dispatch({type: 'LOGIN', payload: {name: json.name, role: json.role, token: json.token}});

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