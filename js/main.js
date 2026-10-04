document.documentElement.style.setProperty("--sea", "#cf834b");
document.documentElement.style.setProperty("--sea-deep", "#363b2b");
document.querySelectorAll(".hero, .page-hero, .stop-time").forEach((el) => {
  el.style.background = "#363b2b";
});
document.querySelectorAll(".day-card .side, .btn:not(.ghost)").forEach((el) => {
  el.style.background = "#cf834b";
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".listen")) return;
  const summary = event.target.closest(".story summary");
  if (!summary) return;
  const details = summary.parentElement;
  document.querySelectorAll(".story[open]").forEach((open) => {
    if (open !== details) open.removeAttribute("open");
  });
});

const EAR_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7.5 10.5c0-3.2 2.4-5.7 5.6-5.7 3.3 0 5.9 2.4 5.9 6.2 0 4.2-2.3 7.2-5.9 9.5"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7.5 10.5v2.8c0 1.6 1 2.7 2.4 3.2M5.8 13.2c.4 3.4 2.7 5.8 6.4 6.7"/></svg>`;

let speechQueue = [];
let activeListen = null;

function italianVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("it")) ||
    voices.find((voice) => /italian|italiano/i.test(voice.name)) ||
    null
  );
}

function stopSpeech() {
  speechQueue = [];
  window.speechSynthesis?.cancel();
  if (activeListen) {
    activeListen.classList.remove("is-on");
    activeListen.setAttribute("aria-pressed", "false");
    activeListen.setAttribute("aria-label", "Ascolta");
    activeListen = null;
  }
}

function speakNext() {
  if (!speechQueue.length) {
    stopSpeech();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(speechQueue.shift());
  utterance.lang = "it-IT";
  const voice = italianVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95;
  utterance.onend = speakNext;
  utterance.onerror = stopSpeech;
  window.speechSynthesis.speak(utterance);
}

function storyParagraphs(details) {
  return [...details.querySelectorAll("h3, p")]
    .map((el) => el.textContent.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function toggleListen(details, button) {
  if (activeListen === button) {
    stopSpeech();
    return;
  }
  stopSpeech();
  const parts = storyParagraphs(details);
  if (!parts.length) return;
  details.setAttribute("open", "");
  button.classList.add("is-on");
  button.setAttribute("aria-pressed", "true");
  button.setAttribute("aria-label", "Interrompi");
  activeListen = button;
  speechQueue = parts;
  window.setTimeout(speakNext, 80);
}

function enhanceStories() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener("voiceschanged", italianVoice);

  document.querySelectorAll("details.story").forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary || summary.querySelector(".listen")) return;

    const label = document.createElement("span");
    label.className = "story-label";
    while (summary.firstChild) label.appendChild(summary.firstChild);
    summary.appendChild(label);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "listen";
    button.setAttribute("aria-label", "Ascolta");
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = EAR_ICON;
    summary.appendChild(button);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleListen(details, button);
    });

    details.addEventListener("toggle", () => {
      if (!details.open && activeListen === button) stopSpeech();
    });
  });
}

enhanceStories();

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
