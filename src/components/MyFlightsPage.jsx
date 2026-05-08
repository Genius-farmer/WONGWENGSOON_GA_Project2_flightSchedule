import { useEffect, useState } from "react";
import { formatTime } from "../utils/time";
import { fetchSavedFlights, deleteSavedFlight } from "../api/airtable";

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

const MyFlightsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchSavedFlights()
      .then((recs) => setRecords(recs))
      .catch((err) => {
        console.error(err);
        setError("Problem loading saved flights.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="page-title-block">
        <h1>My Flights</h1>
        <p className="page-title-block__subtitle">
          Saved routes in a digital boarding pass style.
        </p>
      </div>

      {loading && <p className="info-text">Loading saved flights...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && records.length === 0 && (
        <p className="info-text">You have no saved flights yet.</p>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="flight-cards-grid">
          {records.map((record) => {
            const f = record.fields || {};
            const depCode = f.From || "N/A";
            const arrCode = f.To || "N/A";
            const status = f.Status || "Unknown";

            return (
              <article className="flight-card" key={record.id}>
                <div className="flight-card__top">
                  <div>
                    <p className="flight-card__eyebrow">Flight</p>
                    <h2 className="flight-card__title">
                      {f["Flight Number"] || "N/A"}
                    </h2>
                  </div>
                  <span className={getStatusClassName(status)}>
                    {formatStatusLabel(status)}
                  </span>
                </div>

                <div className="route-strip" aria-label="Route visualization">
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
                    <p className="meta-label">Date</p>
                    <p className="meta-value">{f.Date || "N/A"}</p>
                  </div>
                  <div>
                    <p className="meta-label">Departure Time</p>
                    <p className="meta-value">
                      {formatTime(f["Departure Time"] || "")}
                    </p>
                  </div>
                  <div>
                    <p className="meta-label">Arrival Time</p>
                    <p className="meta-value">
                      {formatTime(f["Arrival Time"] || "")}
                    </p>
                  </div>
                  <div>
                    <p className="meta-label">Departure Terminal</p>
                    <p className="meta-value">
                      {f["Departure Terminal"] || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="meta-label">Arrival Terminal</p>
                    <p className="meta-value">
                      {f["Arrival Terminal"] || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="meta-label">Aircraft</p>
                    <p className="meta-value">{f.Aircraft || "N/A"}</p>
                  </div>
                </div>

                <div className="flight-actions">
                  <button
                    type="button"
                    className="button-danger"
                    onClick={async () => {
                      setDeleteError("");
                      setDeletingId(record.id);
                      try {
                        await deleteSavedFlight(record.id);
                        setRecords((prev) =>
                          prev.filter((r) => r.id !== record.id),
                        );
                      } catch (err) {
                        console.error(err);
                        setDeleteError("Problem deleting this flight.");
                      } finally {
                        setDeletingId("");
                      }
                    }}
                    disabled={deletingId === record.id}
                  >
                    {deletingId === record.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {deleteError && <p className="error-message">{deleteError}</p>}
    </div>
  );
};

export default MyFlightsPage;
