const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_TOKEN) {
  console.warn("Missing Airtable env variables!");
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

export async function fetchFlightByNumberAndDate(flightNumber, date) {
  const normalised = (flightNumber || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const normalisedDate = (date || "").trim();

  const formula = `AND(
    SUBSTITUTE(UPPER({Flight Number}), " ", "") = "${normalised}",
    {Date} = "${normalisedDate}"
  )`;

  console.log("AIRTABLE_URL", AIRTABLE_URL);
  console.log("formula", formula);
  console.log("token present?", !!AIRTABLE_TOKEN);

  const url = new URL(AIRTABLE_URL);
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", "5");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Airtable error status:", res.status, text);
    throw new Error(`Airtable error: ${res.status}`);
  }

  const data = await res.json();
  return data.records; // each: { id, fields, createdTime }
}

export async function fetchFlightsByRouteAndDate(from, to, date) {
  const upperFrom = (from || "").trim().toUpperCase();
  const upperTo = (to || "").trim().toUpperCase();
  const normalisedDate = (date || "").trim();

  const formula = `AND(
    UPPER({From}) = "${upperFrom}",
    UPPER({To}) = "${upperTo}",
    {Date} = "${normalisedDate}"
  )`;

  console.log("route formula", formula);

  const url = new URL(AIRTABLE_URL);
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", "50");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Airtable route error:", res.status, text);
    throw new Error(`Airtable route error: ${res.status}`);
  }

  const data = await res.json();
  return data.records; // array of Airtable records
}
