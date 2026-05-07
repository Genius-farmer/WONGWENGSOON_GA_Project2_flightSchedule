import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatTime } from "../utils/time";
import {
  fetchFlightByNumberAndDate,
  fetchFlightsByRouteAndDate,
} from "../api/airtable";

const FlightResultsPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const mode = params.get("mode");

  const flight = params.get("flight");
  const date = params.get("date");

  const origin = params.get("origin");
  const dest = params.get("dest");

  const normalisedFlight = (flight || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const normalisedDate = (date || "").trim();

  const from = (origin || "").trim().toUpperCase();
  const to = (dest || "").trim().toUpperCase();

  const [byFlightRecords, setByFlightRecords] = useState([]);
  const [byFlightLoading, setByFlightLoading] = useState(false);
  const [byFlightError, setByFlightError] = useState("");

  const [byRouteRecords, setByRouteRecords] = useState([]);
  const [byRouteLoading, setByRouteLoading] = useState(false);
  const [byRouteError, setByRouteError] = useState("");

  let results = [];

  useEffect(() => {
    if (mode !== "byFlight") return;
    if (!normalisedFlight || !normalisedDate) return;

    setByFlightLoading(true);
    setByFlightError("");
    setByFlightRecords([]);

    fetchFlightByNumberAndDate(normalisedFlight, normalisedDate)
      .then((records) => {
        setByFlightRecords(records || []);
      })
      .catch((err) => {
        console.error(err);
        setByFlightError("Problem loading flight data.");
      })
      .finally(() => setByFlightLoading(false));
  }, [mode, normalisedFlight, normalisedDate]);

  useEffect(() => {
    if (mode !== "byRoute") return;
    if (!from || !to || !date) return;

    setByRouteLoading(true);
    setByRouteError("");
    setByRouteRecords([]);

    fetchFlightsByRouteAndDate(from, to, date)
      .then((records) => {
        setByRouteRecords(records || []);
      })
      .catch((err) => {
        console.error(err);
        setByRouteError("Problem loading route flights.");
      })
      .finally(() => setByRouteLoading(false));
  }, [mode, from, to, date]);

  const mainRecord = mode === "byFlight" ? byFlightRecords[0] || null : null;

  let departureAirportName = "";
  let arrivalAirportName = "";
  let departureTime = "";
  let arrivalTime = "";
  let departureTerminal = "";
  let arrivalTerminal = "";
  let durationText = "";
  let aircraftText = "";

  if (mainRecord && mode === "byFlight") {
    const fields = mainRecord.fields || {};

    departureAirportName = fields.From || "N/A";
    arrivalAirportName = fields.To || "N/A";

    const depTime = fields["Departure Time"] || "";
    const arrTime = fields["Arrival Time"] || "";

    departureTime = depTime || "";
    arrivalTime = arrTime || "";

    departureTerminal = fields["Departure Terminal"] || "N/A";
    arrivalTerminal = fields["Arrival Terminal"] || "N/A";

    if (depTime && arrTime) {
      const depDateObj = new Date(depTime);
      const arrDateObj = new Date(arrTime);
      const diffMs = arrDateObj - depDateObj;

      if (!Number.isNaN(diffMs) && diffMs > 0) {
        const diffMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        durationText = `${hours} hr ${minutes} min`;
      }
    }

    aircraftText = fields.Aircraft || "N/A";
  }

  console.log("BY ROUTE PARAMS:", { mode, from, to, date });
  console.log("BY ROUTE RECORDS:", byRouteRecords);

  return (
    <div>
      <h1>Search results</h1>
      {mode === "byRoute" && origin && dest && date && (
        <p>
          {origin.toUpperCase()} → {dest.toUpperCase()} on {date}
        </p>
      )}

      {mode === "byFlight" && flight && date && (
        <p>
          Flight {flight.toUpperCase()} on {date}
        </p>
      )}

      {mode === "byFlight" && byFlightLoading && <p>Loading flight data...</p>}
      {mode === "byFlight" && byFlightError && (
        <p style={{ color: "red" }}>{byFlightError}</p>
      )}

      {mode === "byFlight" && mainRecord && (
        <>
          <h2>Departure</h2>
          <p>Airport: {departureAirportName}</p>
          <p>Scheduled Time: {formatTime(departureTime)}</p>
          <p>Terminal: {departureTerminal}</p>
          <p>Duration: {durationText || "N/A"}</p>

          <h2>Arrival</h2>
          <p>Airport: {arrivalAirportName}</p>
          <p>Scheduled Time: {formatTime(arrivalTime)}</p>
          <p>Terminal: {arrivalTerminal}</p>

          <h2>Flight Details</h2>
          <p>Aircraft: {aircraftText}</p>

          <div className="flight-actions">
            <button type="button" onClick={() => navigate("/")}>
              Track Another Flight
            </button>
            <button
              type="button"
              onClick={() => {
                // later: call your "save flight" logic here
                // e.g. save to Airtable or to local state
                alert("Save My Flight clicked (wire this up next)");
              }}
            >
              Save My Flight
            </button>
          </div>
        </>
      )}

      {mode === "byFlight" &&
        !byFlightLoading &&
        !mainRecord &&
        !byFlightError && (
          <p>No flight found for that flight number on that day.</p>
        )}

      {mode === "byRoute" && (
        <>
          <h2>Route Matches</h2>

          {byRouteLoading && <p>Loading route flights...</p>}
          {byRouteError && <p style={{ color: "red" }}>{byRouteError}</p>}

          {!byRouteLoading && !byRouteError && byRouteRecords.length > 0 ? (
            <ul>
              {byRouteRecords.map((record) => {
                const fields = record.fields || {};

                const routeDepTime = fields["Departure Time"] || "";
                const routeArrTime = fields["Arrival Time"] || "";
                const flightNumber =
                  fields["Flight Number"] || "Unknown flight";
                const status = fields.Status || "N/A"; // only if you add Status

                return (
                  <li key={record.id}>
                    {flightNumber} – Status: {status} – Dep:{" "}
                    {formatTime(routeDepTime)} – Arr: {formatTime(routeArrTime)}
                  </li>
                );
              })}
            </ul>
          ) : (
            !byRouteLoading &&
            !byRouteError && <p>No route flights found for that day.</p>
          )}
        </>
      )}
    </div>
  );
};

export default FlightResultsPage;
