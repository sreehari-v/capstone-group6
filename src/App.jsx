import { useState } from "react";
import "./App.css";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <button
        style={{ position: "absolute", top: "10px", left: "10px" }}
        className="mb-6 px-6 py-2 bg-primary text-white font-medium rounded-md shadow hover:bg-primary/90"
        onClick={() => {
          setShowLogin(!showLogin);
        }}
      >
        {showLogin ? "Hide" : "Show"} Login
      </button>
      {showLogin ? <LoginPage /> : <SignupPage />}
    </>
  );
}

export default App;
