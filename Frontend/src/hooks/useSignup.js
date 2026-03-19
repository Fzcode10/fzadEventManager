import { useState, useContext } from "react";
import { AuthContext } from '../Context/AuthContext';

export const Signup = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);

  const signup = async (formData) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/visitor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      // console.log(JSON.stringify(json));

      if (res.ok) {
        // local storage
        localStorage.setItem("user", JSON.stringify(json.token));
        localStorage.setItem(
          "userDetials",
          JSON.stringify({
            name: json.name,
            role: json.role,
            token: json.token
          })
        );

        dispatch({ type: 'LOGIN', payload: { name: json.name, role: json.role, token: json.token } });

        setIsLoading(false);
      } else {
        setIsLoading(false);
        throw Error(json.error);
      }
    } catch (error) {
      setError(error.message);
      console.log(error.message);
    }
  };

  return { signup, error, isLoading, setError };
};
