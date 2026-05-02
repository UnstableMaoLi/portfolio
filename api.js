"use strict";

/*
  Лабораторна робота №5
  Тема: використання даних із зовнішніх джерел, інтеграція із зовнішнім API.

  API: GeoDB Cities
  Endpoint: GET https://wft-geo-db.p.rapidapi.com/v1/geo/cities
  Реалізовано: fetch-запит, параметри URL, обробка помилок, рендер JSON-відповіді у DOM.
*/

const GEO_DB_ENDPOINT = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";
const GEO_DB_HOST = "wft-geo-db.p.rapidapi.com";

const demoCities = [
  {
    name: "Kyiv",
    country: "Ukraine",
    countryCode: "UA",
    region: "Kyiv City",
    latitude: 50.45,
    longitude: 30.52,
    population: 2950800,
    timezone: "Europe/Kyiv"
  },
  {
    name: "Lviv",
    country: "Ukraine",
    countryCode: "UA",
    region: "Lviv Oblast",
    latitude: 49.84,
    longitude: 24.03,
    population: 717510,
    timezone: "Europe/Kyiv"
  },
  {
    name: "Kharkiv",
    country: "Ukraine",
    countryCode: "UA",
    region: "Kharkiv Oblast",
    latitude: 49.99,
    longitude: 36.23,
    population: 1430885,
    timezone: "Europe/Kyiv"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("citySearchForm");
  const demoButton = document.getElementById("demoDataButton");
  const clearButton = document.getElementById("clearApiButton");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadCities(form);
  });

  demoButton?.addEventListener("click", () => {
    setStatus("Demo data is shown. Use a RapidAPI key to receive live data from GeoDB Cities.", "success");
    renderCities(demoCities);
  });

  clearButton?.addEventListener("click", () => {
    form.reset();
    form.elements.countryIds.value = "UA";
    form.elements.namePrefix.value = "Ky";
    form.elements.minPopulation.value = "100000";
    form.elements.limit.value = "5";
    renderCities([]);
    setStatus("Results cleared. Enter search parameters and load cities again.", "default");
  });
});

async function loadCities(form) {
  const apiKey = form.elements.apiKey.value.trim();

  if (!apiKey) {
    setStatus("Please enter your RapidAPI key first. Without it GeoDB Cities will return an authorization error.", "error");
    renderCities([]);
    return;
  }

  const url = buildCitiesUrl(form);
  setStatus("Loading data from GeoDB Cities API...", "loading");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": GEO_DB_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const cities = Array.isArray(json.data) ? json.data : [];

    if (!cities.length) {
      setStatus("The API returned no cities for these filters. Try another prefix, country or population value.", "warning");
      renderCities([]);
      return;
    }

    setStatus(`Loaded ${cities.length} cities from GeoDB Cities API.`, "success");
    renderCities(cities);
  } catch (error) {
    setStatus(`Error: ${error.message}. Check the API key, Internet connection or request limit.`, "error");
    renderCities([]);
  }
}

function buildCitiesUrl(form) {
  const params = new URLSearchParams();
  const countryIds = form.elements.countryIds.value.trim();
  const namePrefix = form.elements.namePrefix.value.trim();
  const minPopulation = form.elements.minPopulation.value.trim();
  const limit = form.elements.limit.value.trim() || "5";

  if (countryIds) params.set("countryIds", countryIds);
  if (namePrefix) params.set("namePrefix", namePrefix);
  if (minPopulation) params.set("minPopulation", minPopulation);
  params.set("limit", limit);
  params.set("sort", "-population");

  return `${GEO_DB_ENDPOINT}?${params.toString()}`;
}

function renderCities(cities) {
  const results = document.getElementById("cityResults");
  const counter = document.getElementById("cityCounter");

  if (!results || !counter) return;

  counter.textContent = `${cities.length} cities`;

  if (!cities.length) {
    results.innerHTML = `
      <article class="card empty-card">
        <h3>No cities to display</h3>
        <p>Use the form above to request data from the external API.</p>
      </article>
    `;
    return;
  }

  results.innerHTML = cities.map((city) => `
    <article class="card city-card">
      <div class="city-card-header">
        <span class="badge">${escapeApiHtml(city.countryCode || "N/A")}</span>
        <span class="city-type">${escapeApiHtml(city.type || "CITY")}</span>
      </div>
      <h3>${escapeApiHtml(city.name || "Unknown city")}</h3>
      <p>${escapeApiHtml(city.country || "Unknown country")}${city.region ? `, ${escapeApiHtml(city.region)}` : ""}</p>
      <dl class="city-stats">
        <div>
          <dt>Population</dt>
          <dd>${formatNumber(city.population)}</dd>
        </div>
        <div>
          <dt>Latitude</dt>
          <dd>${formatCoordinate(city.latitude)}</dd>
        </div>
        <div>
          <dt>Longitude</dt>
          <dd>${formatCoordinate(city.longitude)}</dd>
        </div>
        <div>
          <dt>Timezone</dt>
          <dd>${escapeApiHtml(city.timezone || "—")}</dd>
        </div>
      </dl>
    </article>
  `).join("");
}

function setStatus(message, type = "default") {
  const status = document.getElementById("apiStatus");
  if (!status) return;

  status.textContent = message;
  status.className = `card api-status-card api-status-${type}`;
}

function formatNumber(value) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("uk-UA").format(value);
}

function formatCoordinate(value) {
  if (typeof value !== "number") return "—";
  return value.toFixed(4);
}

function escapeApiHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
