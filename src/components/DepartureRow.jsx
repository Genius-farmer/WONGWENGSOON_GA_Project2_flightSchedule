import { formatTime } from "../utils/time";

const getDepartureDisplayTime = (departure) => {
  if (!departure) return null;
  return (
    departure.actualTime || departure.estimatedTime || departure.scheduledTime
  );
};

const DepartureRow = ({ flight }) => {
  const { departure, flight: flightInfo, codeshared, status } = flight;

  const time =
    departure?.scheduleTime ||
    departure?.estimatedTime ||
    departure?.actualTime;

  const primaryCode = flightInfo?.iataNumber || flightInfo?.number || "N/A";
  const codeshareCode = codeshared?.flight?.iataNumber;

  const terminal = departure?.terminal ? `T${departure.terminal}` : "N/A";
  const gate = departure?.gate || "N/A";

  return (
    <tr>
      <td>{formatTime(time)}</td>
      <td>
        {primaryCode}
        {codeshareCode && (
          <div style={{ fontSize: "0.8rem", color: "#555" }}>
            Codeshare: {codeshareCode}
          </div>
        )}
      </td>
      <td>{terminal}</td>
      <td>{gate}</td>
      <td>{status}</td>
    </tr>
  );
};

export default DepartureRow;
