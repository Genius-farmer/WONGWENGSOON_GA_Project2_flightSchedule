import { formatTime } from "../utils/time";

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

const formatFlightCode = (code) => {
  if (!code) return "N/A";
  return String(code).toUpperCase();
};

const ArrivalRow = ({ flight }) => {
  const { arrival, flight: flightInfo, codeshared, status } = flight;

  const time =
    arrival?.scheduledTime || arrival?.estimatedTime || arrival?.actualTime;

  const primaryCode = formatFlightCode(
    flightInfo?.iataNumber || flightInfo?.number,
  );
  const codeshareCode = codeshared?.flight?.iataNumber
    ? formatFlightCode(codeshared?.flight?.iataNumber)
    : "";

  const terminal = arrival?.terminal ? `T${arrival.terminal}` : "N/A";
  const gate = arrival?.gate || "N/A";

  return (
    <tr>
      <td>{formatTime(time)}</td>
      <td>
        {primaryCode}
        {codeshareCode && (
          <div className="codeshare-note">Codeshare: {codeshareCode}</div>
        )}
      </td>
      <td>{terminal}</td>
      <td>{gate}</td>
      <td>
        <span className={getStatusClassName(status)}>
          {formatStatusLabel(status)}
        </span>
      </td>
    </tr>
  );
};

export default ArrivalRow;
