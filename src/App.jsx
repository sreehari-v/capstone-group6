import "./App.css";
import MainNavBar from "./components/MainNavBar/MainNavBar";
import Home from "./pages/Home";
import MainFooter from "./components/MainFooter/MainFooter";

function App() {

  return (
    <div>
      <MainNavBar />
      <Home />
      <MainFooter />
    </div>
  );
}

export default App;
