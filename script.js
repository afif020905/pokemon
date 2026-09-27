const form = document.getElementById("pokemonForm");
const input = document.getElementById("pokemonInput");
const message = document.getElementById("message");
const container = document.getElementById("pokemonContainer");
const suggestions = document.getElementById("suggestions");

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
let allPokemonList = [];

// Load full Pokémon list on page start
async function loadPokemonList() {
  try {
    const response = await fetch(`${API_URL}?limit=1300`);
    const data = await response.json();
    allPokemonList = data.results;
    showMessage("");
    getPokemon("pikachu");
  } catch (error) {
    showMessage("Failed to load Pokémon database.");
  }
}

// Live search matching with sprite icons
input.addEventListener("input", () => {
  const query = input.value.trim().toLowerCase();
  suggestions.innerHTML = "";

  if (!query) {
    suggestions.hidden = true;
    return;
  }

  const matches = allPokemonList
    .filter(p => p.name.includes(query))
    .slice(0, 8);

  if (matches.length === 0) {
    suggestions.hidden = true;
    return;
  }

  matches.forEach(item => {
    // Extract ID to get official sprite artwork icon
    const id = item.url.split("/").filter(Boolean).pop();
    const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    const li = document.createElement("li");
    li.className = "suggestion-item";
    li.innerHTML = `
      <img src="${iconUrl}" alt="${item.name}" class="suggestion-icon" loading="lazy">
      <span>${capitalize(item.name)}</span>
    `;

    li.addEventListener("click", () => {
      input.value = item.name;
      suggestions.hidden = true;
      getPokemon(item.name);
    });

    suggestions.appendChild(li);
  });

  suggestions.hidden = false;
});

// Close suggestions on clicking outside
document.addEventListener("click", (e) => {
  if (!form.contains(e.target)) {
    suggestions.hidden = true;
  }
});

// Submit form
form.addEventListener("submit", (event) => {
  event.preventDefault();
  suggestions.hidden = true;
  const value = input.value.trim().toLowerCase();
  if (!value) return;
  getPokemon(value);
});

async function getPokemon(nameOrId) {
  showMessage(`Loading ${nameOrId}...`);
  container.innerHTML = "";
  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(nameOrId)}`);
    if (!response.ok) throw new Error("Not found");
    const pokemon = await response.json();
    renderPokemon(pokemon);
    showMessage("");
  } catch (error) {
    showMessage("Pokémon not found.Enter valid character name.");
  }
}

function renderPokemon(pokemon) {
  const types = pokemon.types
    .map(item => `<span class="type ${item.type.name}">${capitalize(item.type.name)}</span>`)
    .join("");

  const abilities = pokemon.abilities
    .map(item => `<span class="ability">${formatName(item.ability.name)}</span>`)
    .join("");

  const stats = {
    HP: getStat(pokemon, "hp"),
    Attack: getStat(pokemon, "attack"),
    Defense: getStat(pokemon, "defense"),
    "Special Attack": getStat(pokemon, "special-attack"),
    "Special Defense": getStat(pokemon, "special-defense"),
    Speed: getStat(pokemon, "speed")
  };

  const statsHTML = Object.entries(stats)
    .map(([name, value]) => `
      <div class="stat">
        <div class="stat-header">
          <span>${name}</span>
          <strong>${value}</strong>
        </div>
        <div class="stat-bar">
          <span style="width: ${Math.min((value / 160) * 100, 100)}%"></span>
        </div>
      </div>
    `)
    .join("");

  container.innerHTML = `
    <article class="pokemon-card">
      <div class="pokemon-top">
        <div>
          <span class="pokemon-id">#${String(pokemon.id).padStart(3, "0")}</span>
          <h2>${capitalize(pokemon.name)}</h2>
          <div class="types">${types}</div>
        </div>
        <div class="pokemon-image">
          <img
            src="${pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}"
            alt="${capitalize(pokemon.name)}"
          >
        </div>
      </div>

      <div class="details">
        <div>
          <span>Height</span>
          <strong>${(pokemon.height / 10).toFixed(1)} m</strong>
        </div>
        <div>
          <span>Weight</span>
          <strong>${(pokemon.weight / 10).toFixed(1)} kg</strong>
        </div>
      </div>

      <section class="section">
        <h3>Stats</h3>
        <div class="stats">${statsHTML}</div>
      </section>

      <section class="section">
        <h3>Abilities</h3>
        <div class="abilities">${abilities}</div>
      </section>
    </article>
  `;
}

function getStat(pokemon, statName) {
  const stat = pokemon.stats.find(item => item.stat.name === statName);
  return stat ? stat.base_stat : 0;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatName(value) {
  return value.split("-").map(word => capitalize(word)).join(" ");
}

function showMessage(text) {
  message.textContent = text;
}

loadPokemonList();
