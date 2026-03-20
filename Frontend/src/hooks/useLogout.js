import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

export const useLogout = () => {
    const {dispatch} = useContext(AuthContext);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem("userDetails");

        dispatch({type: "LOGOUT"});
    }

    return {logout};
}