const FLIGHT_API_BASE = import.meta.env.VITE_FLIGHT_API_BASE; // e.g. https://aviation-edge.com/v2/public/timetable
const FLIGHT_API_KEY = import.meta.env.VITE_FLIGHT_API_KEY;
const FLIGHT_API_IATA = import.meta.env.VITE_FLIGHT_API_IATA; // default airport, e.g. SIN

const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_TOKEN) {
  console.warn("Missing Airtable env variables!");
}

const AIRTABLE_URL =
  AIRTABLE_BASE_ID && AIRTABLE_TABLE_NAME
    ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`
    : "";

const escapeAirtableFormulaString = (value) =>
  (value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export async function fetchFlightByNumberAndDate(flightNumber, date) {
  const normalised = (flightNumber || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const normalisedDate = (date || "").trim();

  if (!FLIGHT_API_BASE || !FLIGHT_API_KEY) {
    throw new Error("Missing flight API env variables");
  }

  const baseUrl = new URL(FLIGHT_API_BASE);
  baseUrl.searchParams.set("key", FLIGHT_API_KEY);
  if (FLIGHT_API_IATA) {
    baseUrl.searchParams.set("iataCode", FLIGHT_API_IATA);
  }

  const depUrl = new URL(baseUrl);
  depUrl.searchParams.set("type", "departure");
  const arrUrl = new URL(baseUrl);
  arrUrl.searchParams.set("type", "arrival");

  const [depRes, arrRes] = await Promise.all([
    fetch(depUrl.toString()),
    fetch(arrUrl.toString()),
  ]);

  if (!depRes.ok || !arrRes.ok) {
    const depText = await depRes.text();
    const arrText = await arrRes.text();
    console.error("Flight API error (by number):", depRes.status, depText);
    console.error("Flight API error (by number):", arrRes.status, arrText);
    throw new Error("Flight API error");
  }

  const depData = await depRes.json();
  const arrData = await arrRes.json();

  const allFlights = [
    ...(Array.isArray(depData) ? depData : []),
    ...(Array.isArray(arrData) ? arrData : []),
  ];

  const matches = allFlights.filter((f) => {
    const rawFlightNumber =
      f.flight?.iataNumber ??
      (f.flight?.number != null ? String(f.flight.number) : "");

    const flightNumberNorm = (rawFlightNumber || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    const matchesFlight = flightNumberNorm === normalised;

    return matchesFlight;
  });

  console.log(
    "first 5 flights from API:",
    allFlights.slice(0, 5).map((f) => ({
      iataNumber: f.flight?.iataNumber,
      scheduled: f.departure?.scheduledTime,
    })),
  );
  console.log("fetchFlightByNumberAndDate matches:", {
    normalised,
    normalisedDate,
    count: matches.length,
    matches,
  });

  return matches;
}

export async function fetchFlightsByRouteAndDate(from, to, date) {
  const upperFrom = (from || "").trim().toUpperCase();
  const upperTo = (to || "").trim().toUpperCase();
  const normalisedDate = (date || "").trim(); // YYYY-MM-DD

  if (!FLIGHT_API_BASE || !FLIGHT_API_KEY) {
    throw new Error("Missing flight API env variables");
  }

  const url = new URL(FLIGHT_API_BASE);
  url.searchParams.set("key", FLIGHT_API_KEY);
  url.searchParams.set("iataCode", upperFrom);
  url.searchParams.set("type", "departure");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    console.error("Flight API error (by route):", res.status, text);
    throw new Error(`Flight API error: ${res.status}`);
  }

  const data = await res.json();
  const flights = Array.isArray(data) ? data : [];

  const matches = flights.filter((f) => {
    const dep = (f.departure?.iataCode || "").trim().toUpperCase();
    const arr = (f.arrival?.iataCode || "").trim().toUpperCase();
    const sched = f.departure?.scheduledTime || "";
    const schedDate = sched.slice(0, 10); // YYYY-MM-DD

    return dep === upperFrom && arr === upperTo && schedDate === normalisedDate;
  });

  console.log("fetchFlightsByRouteAndDate matches:", {
    upperFrom,
    upperTo,
    normalisedDate,
    count: matches.length,
  });

  return matches;
}

export async function saveFlightToAirtable(flight, date) {
  if (!AIRTABLE_URL || !AIRTABLE_TOKEN) {
    throw new Error("Airtable is not configured");
  }

  const dep = flight.departure || {};
  const arr = flight.arrival || {};
  const aircraft = flight.aircraft || {};
  const flightInfo = flight.flight || {};

  const fields = {
    "Flight Number":
      flightInfo.iataNumber ??
      (flightInfo.number != null ? String(flightInfo.number) : ""),
    Date: date || (dep.scheduledTime || "").slice(0, 10),
    From: dep.iataCode || "",
    To: arr.iataCode || "",
    "Departure Time":
      dep.scheduledTime || dep.estimatedTime || dep.actualTime || "",
    "Arrival Time":
      arr.scheduledTime || arr.estimatedTime || arr.actualTime || "",
    "Departure Terminal": dep.terminal || "",
    "Arrival Terminal": arr.terminal || "",
    Aircraft: aircraft.model || aircraft.regNumber || "",
    Status: flight.status || "",
  };

  const flightNumberKey = (fields["Flight Number"] || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const dateKey = (fields.Date || "").trim();
  const departureTimeKey = (fields["Departure Time"] || "").trim();

  if (flightNumberKey && dateKey && departureTimeKey) {
    const duplicateFormula = `AND(SUBSTITUTE(UPPER({Flight Number}), " ", "") = "${escapeAirtableFormulaString(flightNumberKey)}", {Date} = "${escapeAirtableFormulaString(dateKey)}", {Departure Time} = "${escapeAirtableFormulaString(departureTimeKey)}")`;

    const checkUrl = new URL(AIRTABLE_URL);
    checkUrl.searchParams.set("filterByFormula", duplicateFormula);
    checkUrl.searchParams.set("maxRecords", "1");

    const checkRes = await fetch(checkUrl.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    if (!checkRes.ok) {
      const text = await checkRes.text();
      console.error("Airtable duplicate check error:", checkRes.status, text);
      throw new Error(`Airtable duplicate check error: ${checkRes.status}`);
    }

    const checkData = await checkRes.json();
    const hasDuplicate = Array.isArray(checkData.records)
      ? checkData.records.length > 0
      : false;

    if (hasDuplicate) {
      throw new Error(
        "This flight is already saved for the same day and departure time.",
      );
    }
  }

  const payload = {
    records: [{ fields }],
  };

  const res = await fetch(AIRTABLE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Airtable save error:", res.status, text);
    throw new Error(`Airtable save error: ${res.status}`);
  }

  const data = await res.json();
  console.log("Saved flight to Airtable:", data);
  return data;
}

export async function fetchSavedFlights() {
  if (!AIRTABLE_URL || !AIRTABLE_TOKEN) {
    throw new Error("Airtable is not configured");
  }

  const url = new URL(AIRTABLE_URL);
  url.searchParams.set("maxRecords", "50"); // or whatever limit you want
  url.searchParams.set("sort[0][field]", "Date");
  url.searchParams.set("sort[0][direction]", "asc");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Airtable fetch saved error:", res.status, text);
    throw new Error(`Airtable fetch saved error: ${res.status}`);
  }

  const data = await res.json();
  return data.records || []; // each: { id, fields }
}

export async function deleteSavedFlight(recordId) {
  if (!AIRTABLE_URL || !AIRTABLE_TOKEN) {
    throw new Error("Airtable is not configured");
  }

  const url = `${AIRTABLE_URL}/${recordId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Airtable delete error:", res.status, text);
    throw new Error(`Airtable delete error: ${res.status}`);
  }
}
