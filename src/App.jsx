import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LiveFlightsPage from "./components/LiveFlightsPage";
import FlightSearchPage from "./components/FlightSearchPage";
import FlightResultsPage from "./components/FlightResultsPage";
import MyFlightsPage from "./components/MyFlightsPage";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<FlightSearchPage />} />
        <Route path="/search/results" element={<FlightResultsPage />} />
        <Route path="/live" element={<LiveFlightsPage />} />
        <Route path="/my-flights" element={<MyFlightsPage />} />
      </Routes>
    </div>
  );
};

export default App;
