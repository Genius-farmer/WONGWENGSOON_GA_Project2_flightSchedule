const FlightSearchBar = ({
  arrivalSearch,
  departureSearch,
  onArrivalChange,
  onDepartureChange,
  arrivals,
  departures,
}) => {
  return (
    <div className="tables-container">
      <div className="table-wrapper">
        <h2>Changi Airport Arrivals</h2>
        <input
          type="text"
          placeholder="Search by flight number"
          value={arrivalSearch}
          onChange={(e) => onArrivalChange(e.target.value)}
        />
        {arrivals}
      </div>

      <div className="table-wrapper">
        <h2>Changi Airport Departures</h2>
        <input
          type="text"
          placeholder="Search by flight number"
          value={departureSearch}
          onChange={(e) => onDepartureChange(e.target.value)}
        />
        {departures}
      </div>
    </div>
  );
};

export default FlightSearchBar;
