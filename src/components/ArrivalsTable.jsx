// src/components/ArrivalsTable.jsx
import ArrivalRow from "./ArrivalRow";

const ArrivalsTable = ({ arrivals }) => {
  return (
    <div>
      <h2>Changi Airport Arrivals</h2>
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
          {arrivals.map((flight, index) => (
            <ArrivalRow key={index} flight={flight} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArrivalsTable;
