
/**
 * API (Simpsons Characters) - formato típico:
 * [{ name, age, state, status, picture, ... , phrases: [...] }, ...]
 * Nota: si el API cambia, el "normalize" intenta adaptarse.
 */
const API_URL = "https://thesimpsonsapi.com/api/characters";

// Estado global
let raw = [];
let filtered = [];

// Helpers DOM
const $ = (sel) => document.querySelector(sel);

// Controles
const qEl = $("#q");
const minAgeEl = $("#minAge");
const maxAgeEl = $("#maxAge");
const statusEl = $("#status")

// UI
const gridEl = $("#grid");
const stateBoxEl = $("#stateBox");

// Normaliza para que siempre tengamos: { name, age, status, picture, phrases[] }
function normalize(item) {
    const name = item.name ?? item.character ?? item.fullName ?? "Sin nombre";

    // age puede venir como number o string
    let age = item.age ?? item.Age ?? item.edad ?? null;
    if (typeof age === "string") {
        const m = age.match(/\d+/);
        age = m ? Number(m[0]) : null;
    }
    if (typeof age !== "number" || Number.isNaN(age)) age = null;

    const status = item.status ?? item.Status ?? "Unknown";
    const picture =
        item.portrait_path ??
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/No_image_available.svg/240px-No_image_available.svg.png";

    // frases: el API a veces trae "phrases" como array; si no, creamos una lista simple
    let phrases = item.phrases ?? item.Phrases ?? item.quote ?? item.quotes ?? null;
    if (Array.isArray(phrases)) {
        phrases = phrases.filter(Boolean).map(String);
    } else if (typeof phrases === "string" && phrases.trim().length) {
        phrases = [phrases.trim()];
    } else if (Array.isArray(item.phrase)) {
        phrases = item.phrase.filter(Boolean).map(String);
    } else {
        phrases = [
            "¡D'oh!",
            "Excelente...",
            "Ay caramba!",
            "No tengo una frase registrada."
        ];
    }

    return { name, age, status, picture, phrases };
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderCards(list) {

    gridEl.innerHTML = list.map(p => {
        const ageText = (p.age === null) ? "—" : p.age;
        const phrase = pickRandom(p.phrases);

        return `
          <article class="card">
            <div class="card-top">
              <div class="avatar">
                <img src="https://cdn.thesimpsonsapi.com/500${escapeHtml(p.picture)}" alt="${escapeHtml(p.name)}" loading="lazy" />
              </div>

              <div class="meta">
                <h3>${escapeHtml(p.name)}</h3>
              </div>

            </div>

            <div class="card-body">
              <div class="kv"><span>Edad</span><b>${escapeHtml(ageText)}</b></div>
              <div class="kv"><span>Estado</span><b>${escapeHtml(p.status)}</b></div>

              <div class="quote">“${escapeHtml(phrase)}”</div>
            </div>
          </article>
        `;
    }).join("");

}

function showState(type, msg) {
    gridEl.style.display = "none";
    stateBoxEl.style.display = "block";
    stateBoxEl.className = type; // loading | error | empty
    stateBoxEl.textContent = msg;
}

function showGrid() {
    stateBoxEl.style.display = "none";
    gridEl.style.display = "grid";
}

function applyFilters(data) {

    console.log(data);

    return data;

}

function showData() {

    cleaned = raw.map(normalize)
    filtered = applyFilters(cleaned);

    showGrid();
    renderCards(filtered);
}

async function loadData() {
    showState("loading", "Cargando datos desde el API de Simpsons...");
    try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();
        raw = Array.isArray(data.results) ? data.results : [];

        showData();
    } catch (err) {
        showState("error", "Error al cargar datos. Revisa tu conexión o el API. (" + err.message + ")");
    }
}

// Eventos
$("#btnApply").addEventListener("click", showData);

// Inicial
loadData();