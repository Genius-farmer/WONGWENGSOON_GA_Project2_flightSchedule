// FlightResultsPage-5.jsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatTime } from "../utils/time";
import {
  fetchFlightByNumberAndDate,
  fetchFlightsByRouteAndDate,
  saveFlightToAirtable,
} from "../api/airtable";

const getStatusClassName = (status) => {
  const value = (status || "").toLowerCase();
  if (
    value.includes("on time") ||
    value.includes("active") ||
    value.includes("landed") ||
    value.includes("arrived") ||
    value.includes("scheduled")
  ) {
    return "status-pill status-pill--positive";
  }
  return "status-pill";
};

const formatStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status
    .toString()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

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
  let departureGate = "";
  let arrivalGate = "";
  let airlineText = "";
  let flightStatus = "";
  let durationText = "";
  let aircraftText = "";

  if (mainRecord && mode === "byFlight") {
    const dep = mainRecord.departure || {};
    const arr = mainRecord.arrival || {};
    const aircraft = mainRecord.aircraft || {};

    departureAirportName = dep.iataCode || dep.icaoCode || "N/A";
    arrivalAirportName = arr.iataCode || arr.icaoCode || "N/A";

    const depTime =
      dep.actualTime || dep.estimatedTime || dep.scheduledTime || "";
    const arrTime =
      arr.actualTime || arr.estimatedTime || arr.scheduledTime || "";

    departureTime = depTime || "";
    arrivalTime = arrTime || "";

    departureTerminal = dep.terminal || "N/A";
    arrivalTerminal = arr.terminal || "N/A";
    departureGate = dep.gate || "N/A";
    arrivalGate = arr.gate || "N/A";
    airlineText = mainRecord.airline?.name || "N/A";
    flightStatus = mainRecord.status || "Unknown";

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

    aircraftText =
      aircraft.model || aircraft.regNumber || aircraft.iataCode || "N/A";
  }

  async function handleSaveClick() {
    if (!mainRecord || mode !== "byFlight") return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      await saveFlightToAirtable(mainRecord, normalisedDate);
      setSaveSuccess("Flight saved to My Flights.");
    } catch (err) {
      console.error(err);
      setSaveError(err?.message || "Problem saving this flight.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title-block">
        <h1>Flight Schedule</h1>

        {mode === "byRoute" && origin && dest && date && (
          <p className="page-title-block__subtitle">
            {origin.toUpperCase()} to {dest.toUpperCase()} on {date}
          </p>
        )}

        {mode === "byFlight" && flight && date && (
          <p className="page-title-block__subtitle">
            Flight {flight.toUpperCase()} on {date}
          </p>
        )}
      </div>

      {mode === "byFlight" && byFlightLoading && (
        <p className="info-text">Loading flight data...</p>
      )}
      {mode === "byFlight" && byFlightError && (
        <p className="error-message">{byFlightError}</p>
      )}

      {mode === "byFlight" && mainRecord && (
        <article className="flight-card flight-card--featured">
          <div className="flight-card__top">
            <div>
              <p className="flight-card__eyebrow">Flight</p>
              <h2 className="flight-card__title">
                {normalisedFlight || "N/A"}
              </h2>
            </div>
            <span className={getStatusClassName(flightStatus)}>
              {formatStatusLabel(flightStatus)}
            </span>
          </div>

          <div className="route-strip" aria-label="Route visualization">
            <p className="route-strip__code">{departureAirportName}</p>
            <div className="route-strip__line">
              <span className="route-strip__plane" aria-hidden="true">
                ✈
              </span>
            </div>
            <p className="route-strip__code route-strip__code--right">
              {arrivalAirportName}
            </p>
          </div>

          <div className="flight-card__meta-grid">
            <div>
              <p className="meta-label">Airline</p>
              <p className="meta-value">{airlineText}</p>
            </div>
            <div>
              <p className="meta-label">Departure Time</p>
              <p className="meta-value">{formatTime(departureTime)}</p>
            </div>
            <div>
              <p className="meta-label">Arrival Time</p>
              <p className="meta-value">{formatTime(arrivalTime)}</p>
            </div>
            <div>
              <p className="meta-label">Departure Terminal</p>
              <p className="meta-value">{departureTerminal}</p>
            </div>
            <div>
              <p className="meta-label">Arrival Terminal</p>
              <p className="meta-value">{arrivalTerminal}</p>
            </div>
            <div>
              <p className="meta-label">Departure Gate</p>
              <p className="meta-value">{departureGate}</p>
            </div>
            <div>
              <p className="meta-label">Arrival Gate</p>
              <p className="meta-value">{arrivalGate}</p>
            </div>
            <div>
              <p className="meta-label">Aircraft</p>
              <p className="meta-value">{aircraftText}</p>
            </div>
            <div>
              <p className="meta-label">Duration</p>
              <p className="meta-value">{durationText || "N/A"}</p>
            </div>
          </div>

          <div className="flight-actions">
            <button type="button" onClick={() => navigate("/")}>
              Track Another Flight
            </button>
            <button type="button" onClick={handleSaveClick} disabled={saving}>
              {saving ? "Saving..." : "Save My Flight"}
            </button>
          </div>

          {saveError && <p className="error-message">{saveError}</p>}
          {saveSuccess && <p className="success-message">{saveSuccess}</p>}
        </article>
      )}

      {mode === "byFlight" &&
        !byFlightLoading &&
        !mainRecord &&
        !byFlightError && (
          <p className="info-text">
            No flight found for that flight number on that day.
          </p>
        )}

      {mode === "byRoute" && (
        <>
          <h2 className="section-title">Route Matches</h2>

          {byRouteLoading && <p className="info-text">Loading route...</p>}
          {byRouteError && <p className="error-message">{byRouteError}</p>}

          {!byRouteLoading && !byRouteError && byRouteRecords.length > 0 ? (
            <div className="flight-cards-grid">
              {byRouteRecords.map((record) => {
                const dep = record.departure || {};
                const arr = record.arrival || {};
                const flightInfo = record.flight || {};

                const routeDepTime =
                  dep.actualTime ||
                  dep.estimatedTime ||
                  dep.scheduledTime ||
                  "";
                const routeArrTime =
                  arr.actualTime ||
                  arr.estimatedTime ||
                  arr.scheduledTime ||
                  "";
                const flightNumber =
                  flightInfo.iataNumber ??
                  (flightInfo.number != null
                    ? String(flightInfo.number)
                    : "Unknown flight");
                const status = record.status || "N/A";
                const depCode = dep.iataCode || dep.icaoCode || from || "N/A";
                const arrCode = arr.iataCode || arr.icaoCode || to || "N/A";
                const airline = record.airline?.name || "N/A";
                const depTerminal = dep.terminal || "N/A";
                const arrTerminal = arr.terminal || "N/A";
                const depGate = dep.gate || "N/A";
                const arrGate = arr.gate || "N/A";

                return (
                  <article
                    className="flight-card"
                    key={
                      record.flight?.iataNumber ||
                      `${dep.iataCode}-${arr.iataCode}-${routeDepTime}`
                    }
                  >
                    <div className="flight-card__top">
                      <div>
                        <p className="flight-card__eyebrow">Flight</p>
                        <h3 className="flight-card__title">{flightNumber}</h3>
                      </div>
                      <span className={getStatusClassName(status)}>
                        {formatStatusLabel(status)}
                      </span>
                    </div>

                    <div
                      className="route-strip"
                      aria-label="Route visualization"
                    >
                      <p className="route-strip__code">{depCode}</p>
                      <div className="route-strip__line">
                        <span className="route-strip__plane" aria-hidden="true">
                          ✈
                        </span>
                      </div>
                      <p className="route-strip__code route-strip__code--right">
                        {arrCode}
                      </p>
                    </div>

                    <div className="flight-card__meta-grid">
                      <div>
                        <p className="meta-label">Airline</p>
                        <p className="meta-value">{airline}</p>
                      </div>
                      <div>
                        <p className="meta-label">Departure Time</p>
                        <p className="meta-value">{formatTime(routeDepTime)}</p>
                      </div>
                      <div>
                        <p className="meta-label">Arrival Time</p>
                        <p className="meta-value">{formatTime(routeArrTime)}</p>
                      </div>
                      <div>
                        <p className="meta-label">Departure Terminal</p>
                        <p className="meta-value">{depTerminal}</p>
                      </div>
                      <div>
                        <p className="meta-label">Arrival Terminal</p>
                        <p className="meta-value">{arrTerminal}</p>
                      </div>
                      <div>
                        <p className="meta-label">Departure Gate</p>
                        <p className="meta-value">{depGate}</p>
                      </div>
                      <div>
                        <p className="meta-label">Arrival Gate</p>
                        <p className="meta-value">{arrGate}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            !byRouteLoading &&
            !byRouteError && (
              <p className="info-text">No route flights found for that day.</p>
            )
          )}
        </>
      )}
    </div>
  );
};

export default FlightResultsPage;
