import { useState, useContext } from "react";
import { AuthContext } from '../Context/AuthContext';

export const Signup = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {dispatch} = useContext(AuthContext);

  const signup = async (formData) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/visitor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      console.log(JSON.stringify(json));

      if (res.ok) {
        // local storage
        localStorage.setItem("visitor", JSON.stringify(json));

        dispatch({ type: "LOGIN", payload: json });

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
