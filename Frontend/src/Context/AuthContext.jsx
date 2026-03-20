import { useReducer, createContext, useEffect } from "react";

export const AuthContext = createContext();

// ✅ Reducer
export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
      };

    case "LOGOUT":
      return {
        user: null,
      };

    default:
      return state;
  }
};

// ✅ Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedUserDetails = localStorage.getItem("userDetails");

      const user = storedUser ? JSON.parse(storedUser) : null;
      const userDetails = storedUserDetails
        ? JSON.parse(storedUserDetails)
        : null;

      if (user && userDetails) {
        dispatch({
          type: "LOGIN",
          payload: {
            ...user,
            name: userDetails.name,
            role: userDetails.role,
          },
        });
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("userDetails");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user: state.user, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};