// src/components/DeparturesTable.jsx
import DepartureRow from "./DepartureRow";

const DeparturesTable = ({ departures, searchTerm }) => {
  const query = searchTerm.toLowerCase();

  const filteredDepartures = departures.filter((flight) => {
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
          {filteredDepartures.length === 0 ? (
            <tr>
              <td colSpan={/* number of columns */ 6}>
                No departures found for “{searchTerm}”.
              </td>
            </tr>
          ) : (
            filteredDepartures.map((flight, index) => (
              <DepartureRow key={index} flight={flight} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeparturesTable;
