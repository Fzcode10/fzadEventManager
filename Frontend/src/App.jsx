import { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { AuthContext } from "./Context/AuthContext";
import Profile from "./components/profile";
import RegisteredEvents from "./components/visitor/visitorEventDetials";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="grow">
        <Routes>
          {/* <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}

          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" />}
          />

          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />

          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <Signup />}
          />

          <Route
            path="/eventDetials"
            element={user ? <RegisteredEvents /> : <Navigate to="/" />}
          />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
