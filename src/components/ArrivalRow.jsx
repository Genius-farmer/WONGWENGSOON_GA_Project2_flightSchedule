// src/components/ArrivalRow.jsx

const getArrivalDisplayTime = (arrival) => {
  if (!arrival) return null;
  return arrival.actualTime || arrival.estimatedTime || arrival.scheduledTime;
};

const ArrivalRow = ({ flight }) => {
  const { arrival, flight: flightInfo, codeshared, status } = flight;

  const rawTime = getArrivalDisplayTime(arrival);

  const displayTime = rawTime
    ? new Date(rawTime).toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const primaryCode = flightInfo?.iataNumber || flightInfo?.number || "N/A";
  const codeshareCode = codeshared?.flight?.iataNumber;

  const terminal = arrival?.terminal ? `T${arrival.terminal}` : "N/A";
  const gate = arrival?.gate || "N/A";

  return (
    <tr>
      <td>{displayTime}</td>
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

export default ArrivalRow;
