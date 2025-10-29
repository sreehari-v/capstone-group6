import { useState } from "react";
import "./App.css";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MainNavBar from "./components/MainNavBar/MainNavBar";
import Home from "./pages/Home";
import MainFooter from "./components/MainFooter/MainFooter";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>
      <MainNavBar />
      <Home />
      <MainFooter />
    </div>
  );
}

export default App;
