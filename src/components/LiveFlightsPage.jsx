import { useEffect, useState } from "react";
import ArrivalsTable from "./ArrivalsTable";
import DeparturesTable from "./DeparturesTable";
import FlightSearchBar from "./FlightSearchBar";

const FLIGHT_API_BASE = import.meta.env.VITE_FLIGHT_API_BASE;
const FLIGHT_API_KEY = import.meta.env.VITE_FLIGHT_API_KEY;
const FLIGHT_API_IATA = import.meta.env.VITE_FLIGHT_API_IATA;

const LiveFlightsPage = () => {
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [arrivalSearch, setArrivalSearch] = useState("");
  const [departureSearch, setDepartureSearch] = useState("");

  useEffect(() => {
    async function loadFlights() {
      setLoading(true);
      setError(null);

      try {
        if (!FLIGHT_API_BASE || !FLIGHT_API_KEY || !FLIGHT_API_IATA) {
          throw new Error("Missing flight API env variables");
        }
        const departuresUrl = `${FLIGHT_API_BASE}?key=${FLIGHT_API_KEY}&iataCode=${FLIGHT_API_IATA}&type=departure`;
        const arrivalsUrl = `${FLIGHT_API_BASE}?key=${FLIGHT_API_KEY}&iataCode=${FLIGHT_API_IATA}&type=arrival`;
        const [depRes, arrRes] = await Promise.all([
          fetch(departuresUrl),
          fetch(arrivalsUrl),
        ]);

        if (!depRes.ok || !arrRes.ok) {
          const depText = await depRes.text();
          const arrText = await arrRes.text();
          console.error("Departures error:", depRes.status, depText);
          console.error("Arrivals error:", arrRes.status, arrText);
          throw new Error("Live flights API error");
        }

        const departuresData = await depRes.json();
        const arrivalsData = await arrRes.json();

        console.log("departuresData:", departuresData);
        console.log("arrivalsData:", arrivalsData);

        // API returns arrays directly, so we can use them as‑is
        const departuresLive = Array.isArray(departuresData)
          ? departuresData
          : [];
        const arrivalsLive = Array.isArray(arrivalsData) ? arrivalsData : [];

        setDepartures(departuresLive);
        setArrivals(arrivalsLive);
      } catch (err) {
        console.error(err);
        setError("Problem loading live flights.");
        setArrivals([]);
        setDepartures([]);
      } finally {
        setLoading(false);
      }
    }

    loadFlights();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-title-block">
        <h1>Changi Airport Flights</h1>
        <p className="page-title-block__subtitle">
          Live arrivals and departures in real time.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="info-text">Loading live flights...</p>
      ) : (
        // ✅ FlightSearchBar is Sibling A — updates parent state via onArrivalChange / onDepartureChange
        // ✅ ArrivalsTable and DeparturesTable are Siblings B & C — read state passed down from parent
        <FlightSearchBar
          arrivalSearch={arrivalSearch}
          departureSearch={departureSearch}
          onArrivalChange={setArrivalSearch}
          onDepartureChange={setDepartureSearch}
          arrivals={
            <ArrivalsTable arrivals={arrivals} searchTerm={arrivalSearch} />
          }
          departures={
            <DeparturesTable
              departures={departures}
              searchTerm={departureSearch}
            />
          }
        />
      )}
    </div>
  );
};

export default LiveFlightsPage;
