// src/components/ArrivalsTable.jsx
import ArrivalRow from "./ArrivalRow";

const ArrivalsTable = ({ arrivals, searchTerm }) => {
  const query = searchTerm.toLowerCase();

  const filteredArrivals = arrivals.filter((flight) => {
    const airlineName = flight.airline?.name || "";
    const flightNumber =
      flight.flight?.iataNumber || flight.flight?.number || "";
    const arrivalAirport = flight.arrival?.iataCode || "";
    const departureAirport = flight.departure?.iataCode || "";

    const haystack = [
      airlineName,
      flightNumber,
      arrivalAirport,
      departureAirport,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Time (SGT)</th>
            <th>Flight</th>
            <th>Terminal</th>
            <th>Gate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredArrivals.length === 0 ? (
            <tr>
              <td colSpan={5}>No arrivals found for “{searchTerm}”.</td>
            </tr>
          ) : (
            filteredArrivals.map((flight, index) => (
              <ArrivalRow key={index} flight={flight} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ArrivalsTable;
