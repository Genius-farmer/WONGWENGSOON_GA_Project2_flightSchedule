import { useEffect, useState } from "react";
import ArrivalsTable from "./components/ArrivalsTable";
import DeparturesTable from "./components/DeparturesTable";

const App = () => {
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = import.meta.env.VITE_AVIATION_EDGE_KEY;
        const arrivalsUrl = `https://aviation-edge.com/v2/public/timetable?key=00e29f-40d247&iataCode=SIN&type=arrival`;
        const departuresUrl = `https://aviation-edge.com/v2/public/timetable?key=00e29f-40d247&iataCode=SIN&type=departure`;

        const [arrivalsRes, departuresRes] = await Promise.all([
          fetch(arrivalsUrl),
          fetch(departuresUrl),
        ]);

        if (!arrivalsRes.ok || !departuresRes.ok) {
          throw new Error(
            `HTTP error! arrivals: ${arrivalsRes.status}, departures: ${departuresRes.status}`,
          );
        }

        const [arrivalsData, departuresData] = await Promise.all([
          arrivalsRes.json(),
          departuresRes.json(),
        ]);

        setArrivals(arrivalsData);
        setDepartures(departuresData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading flights…</div>;
  if (error) return <div>Error loading flights: {error}</div>;

  return (
    <div>
      <h1>Changi Airport Flights (Live)</h1>
      <ArrivalsTable arrivals={arrivals} />
      <DeparturesTable departures={departures} />
    </div>
  );
};

export default App;
