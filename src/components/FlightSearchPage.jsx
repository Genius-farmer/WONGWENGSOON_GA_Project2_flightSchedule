import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FlightSearchPage = () => {
  const [mode, setMode] = useState("byFlight");
  const [flightNumber, setFlightNumber] = useState("");
  const [departingDate, setDepartingDate] = useState("");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeDate, setRouteDate] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // clear old error

    if (mode === "byFlight") {
      if (!flightNumber.trim() || !departingDate.trim()) {
        setError("Please enter both a flight number and a departing date.");
        return; // stop here, do not navigate
      }

      navigate(
        `/search/results?mode=byFlight&flight=${encodeURIComponent(
          flightNumber.trim(),
        )}&date=${encodeURIComponent(departingDate.trim())}`,
      );
    } else {
      if (!origin.trim() || !destination.trim() || !routeDate.trim()) {
        setError("Please enter origin, destination, and a date.");
        return; // stop here, do not navigate
      }

      navigate(
        `/search/results?mode=byRoute&origin=${encodeURIComponent(
          origin.trim(),
        )}&dest=${encodeURIComponent(
          destination.trim(),
        )}&date=${encodeURIComponent(routeDate.trim())}`,
      );
    }
  };

  return (
    <div className="flight-search-page">
      <h1>Flight Tracker</h1>

      <div className="tab-buttons">
        <button
          type="button"
          className={mode === "byFlight" ? "active" : ""}
          onClick={() => setMode("byFlight")}
        >
          By Flight
        </button>
        <button
          type="button"
          className={mode === "byRoute" ? "active" : ""}
          onClick={() => setMode("byRoute")}
        >
          By Route
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flight-search-form">
        {mode === "byFlight" && (
          <>
            <label>
              Flight Number
              <input
                type="text"
                placeholder="Enter flight number(e.g SQ606)"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </label>

            <label>
              Departing Date
              <input
                type="date"
                value={departingDate}
                onChange={(e) => setDepartingDate(e.target.value)}
              />
            </label>
          </>
        )}

        {mode === "byRoute" && (
          <>
            <label>
              From (IATA)
              <input
                type="text"
                placeholder="e.g. SIN"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </label>

            <label>
              To (IATA)
              <input
                type="text"
                placeholder="e.g. HKG"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
              />
            </label>
          </>
        )}

        <button type="submit">Track Flight</button>
        {error && (
          <p
            className="error-message"
            style={{ color: "red", marginTop: "0.5rem" }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default FlightSearchPage;
