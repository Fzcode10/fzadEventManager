import { useReducer, createContext, useEffect } from "react";

export const AuthContext = createContext();

export const visitorAuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthProvider  = ({ children }) => {
  const [state, dispatch] = useReducer(visitorAuthReducer, {
    user: null,
  });

  console.log("auth : ", state);

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem("student"));
    console.log(student);

    if (student) {
      dispatch({ type: "LOGIN", payload: student });
    }
  }, []);

  return (
    <AuthContext.Provider  value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
