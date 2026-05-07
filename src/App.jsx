import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LiveFlightsPage from "./components/LiveFlightsPage";
import FlightSearchPage from "./components/FlightSearchPage";
import FlightResultsPage from "./components/FlightResultsPage";

// temporary placeholder for SearchPage and MyFlightsPage
const SearchPage = () => <div>Search page (coming soon)</div>;
const MyFlightsPage = () => <div>My flights (coming soon)</div>;

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
