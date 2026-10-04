document.documentElement.style.setProperty("--sea", "#cf834b");
document.documentElement.style.setProperty("--sea-deep", "#363b2b");
document.querySelectorAll(".hero, .page-hero, .stop-time").forEach((el) => {
  el.style.background = "#363b2b";
});
document.querySelectorAll(".day-card .side, .btn:not(.ghost)").forEach((el) => {
  el.style.background = "#cf834b";
});

document.addEventListener("click", (event) => {
  const summary = event.target.closest(".story summary");
  if (!summary) return;
  const details = summary.parentElement;
  document.querySelectorAll(".story[open]").forEach((open) => {
    if (open !== details) open.removeAttribute("open");
  });
});

const WEATHER_LABELS = {
  0: "Sereno",
  1: "Prevalentemente sereno",
  2: "Parzialmente nuvoloso",
  3: "Coperto",
  45: "Nebbia",
  48: "Nebbia",
  51: "Pioggerella",
  53: "Pioggerella",
  55: "Pioggerella",
  56: "Pioggerella gelata",
  57: "Pioggerella gelata",
  61: "Pioggia",
  63: "Pioggia",
  65: "Pioggia forte",
  66: "Pioggia gelata",
  67: "Pioggia gelata",
  71: "Neve",
  73: "Neve",
  75: "Neve",
  77: "Neve",
  80: "Rovesci",
  81: "Rovesci",
  82: "Rovesci forti",
  85: "Rovesci di neve",
  86: "Rovesci di neve",
  95: "Temporale",
  96: "Temporale",
  99: "Temporale",
};

const WEATHER_CACHE_KEY = "cph-weather-2026";
const WEATHER_TTL_MS = 30 * 60 * 1000;

function weatherLabel(code) {
  return WEATHER_LABELS[code] || "Variabile";
}

function applyWeather(byDate) {
  document.querySelectorAll(".weather[data-date]").forEach((el) => {
    const day = byDate[el.dataset.date];
    if (!day) return;
    el.textContent = `${weatherLabel(day.code)} · ${day.max}°`;
  });
}

function readWeatherCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.at || Date.now() - cached.at > WEATHER_TTL_MS) return null;
    return cached.byDate;
  } catch {
    return null;
  }
}

async function loadWeather() {
  const slots = document.querySelectorAll(".weather[data-date]");
  if (!slots.length) return;

  const cached = readWeatherCache();
  if (cached) applyWeather(cached);

  const dates = [...slots].map((el) => el.dataset.date).sort();
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=55.6761&longitude=12.5683" +
    "&daily=weathercode,temperature_2m_max" +
    "&timezone=Europe%2FCopenhagen" +
    `&start_date=${dates[0]}&end_date=${dates[dates.length - 1]}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const data = await response.json();
    const byDate = {};
    data.daily.time.forEach((date, index) => {
      byDate[date] = {
        code: data.daily.weathercode[index],
        max: Math.round(data.daily.temperature_2m_max[index]),
      };
    });
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ at: Date.now(), byDate }));
    applyWeather(byDate);
  } catch {
    /* restano i valori già in pagina */
  }
}

loadWeather();
setInterval(loadWeather, WEATHER_TTL_MS);
