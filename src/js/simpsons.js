import '../sass/main.scss';

// Capturo elementos del DOM
let tabBtns = document.querySelectorAll('.tab-btn');
let viewSections = document.querySelectorAll('.view-section');
let charactersGrid = document.querySelector('#characters-grid');
let episodesGrid = document.querySelector('#episodes-grid');
let favoritesGrid = document.querySelector('#favorites-grid');

let loadingMsg = document.querySelector('#loading-msg');
let loadingEpMsg = document.querySelector('#loading-ep-msg');
let noFavsMsg = document.querySelector('#no-favs-msg');

let btnLoadMore = document.querySelector('#btn-load-more');
let btnLoadMoreEpisodes = document.querySelector('#btn-load-more-episodes');

let inputSearch = document.querySelector('#input-search');
let selectStatus = document.querySelector('#select-status');
let selectGender = document.querySelector('#select-gender');
let selectSeason = document.querySelector('#select-season');

let modal = document.querySelector('#character-modal');
let modalInfo = document.querySelector('#modal-info');
let closeBtn = document.querySelector('.close-btn');

// Endpoints y Variables
let API_URL_CHARS = 'https://thesimpsonsapi.com/api/characters';
let API_URL_EPISODES = 'https://thesimpsonsapi.com/api/episodes';

let allCharacters = [];
let allEpisodes = [];
let favorites = JSON.parse(localStorage.getItem('simpsons_favs')) || [];
let currentPageChars = 1;
let currentPageEps = 1;

// Traductores
function traducirEstado(status) {
  if (!status) return 'Desconocido';
  let s = status.toLowerCase();
  if (s === 'alive') return 'Vivo';
  if (s === 'deceased') return 'Muerto';
  return status;
}

function traducirGenero(gender) {
  if (!gender) return 'Desconocido';
  let g = gender.toLowerCase();
  if (g === 'male') return 'Hombre 🚹';
  if (g === 'female') return 'Mujer 🚺';
  return gender;
}

//-----------------------------------
// PESTAÑAS Y VISIBILIDAD DE FILTROS
//-----------------------------------

tabBtns.forEach(btn => {
  btn.addEventListener('click', (event) => {
    tabBtns.forEach(b => b.classList.remove('active'));
    viewSections.forEach(v => v.classList.add('hidden'));

    let clickedBtn = event.target;
    clickedBtn.classList.add('active');
    let tabId = clickedBtn.dataset.tab; 
    document.querySelector(`#${tabId}`).classList.remove('hidden');

    // Muestra u oculta los selectores según la pestaña
    if (tabId === 'tab-episodes') {
      selectStatus.classList.add('hidden');
      selectGender.classList.add('hidden');
      selectSeason.classList.remove('hidden');
    } else {
      selectStatus.classList.remove('hidden');
      selectGender.classList.remove('hidden');
      selectSeason.classList.add('hidden');
    }

    // Repintar la vista activa
    applyFilters();

    if (tabId === 'tab-favorites') renderFavorites();
  });
});

//----------------
// FETCH ASÍNCRONO
//----------------
async function fetchCharacters(page = 1) {
  try {
    if (page > 1) {
      loadingMsg.textContent = "Trayendo más personajes de Springfield... 🍩";
      loadingMsg.style.display = 'block'; // Volvemos a hacerlo visible
      btnLoadMore.classList.add('hidden'); // Ocultamos el botón mientras carga
  
      await new Promise(resolve => setTimeout(resolve, 1000)); // Le doy un segundo de espera para poder ver el mensaje
    }

    let response = await fetch(`${API_URL_CHARS}?page=${page}`);
    let data = await response.json();
    
    allCharacters = [...allCharacters, ...data.results];
    
    // Tras recibir los datos, ocultamos el mensaje y mostrar el botón
    loadingMsg.style.display = 'none';
    btnLoadMore.classList.remove('hidden'); 
    
    applyFilters(); //Aplicamos los filtros que tengamos seleccionados
  } catch (error) {
    console.error("Error al cargar personajes:", error);
    loadingMsg.textContent = "Error al traer los personajes.";
  }
}

async function fetchEpisodes(page = 1) {
  try {
    if (page > 1) {
      loadingEpMsg.textContent = "Buscando más episodios en la base de datos... 📼";
      loadingEpMsg.style.display = 'block';
      btnLoadMoreEpisodes.classList.add('hidden');
  
      await new Promise(resolve => setTimeout(resolve, 1000)); // Le doy un segundo de espera para poder ver el mensaje
    }

    let response = await fetch(`${API_URL_EPISODES}?page=${page}`);
    let data = await response.json();
    
    let nuevosEps = data.results || data.data || data; 
    if(Array.isArray(nuevosEps)) {
      allEpisodes = [...allEpisodes, ...nuevosEps];
      
      loadingEpMsg.style.display = 'none';
      btnLoadMoreEpisodes.classList.remove('hidden');
      
      applyFilters();
    }
  } catch (error) {
    console.error("Error al cargar episodios:", error);
  }
}

//-----------------------
// RENDERIZADO EN EL DOM
//-----------------------

// Renderizo los personajes
function renderCharacters(personajes) {
  charactersGrid.innerHTML = '';
  personajes.forEach(personaje => {
    let isFav = favorites.some(fav => fav.id === personaje.id); 
    let card = document.createElement('article');
    card.classList.add('character-card');
    card.dataset.id = personaje.id; 
    card.dataset.type = "character"; 

    let imageUrl = `https://cdn.thesimpsonsapi.com/200/character/${personaje.id}.webp`;

    card.innerHTML = `
      <button class="btn-fav ${isFav ? 'is-fav' : ''}" data-id="${personaje.id}">
        ${isFav ? '💛' : '🤍'}
      </button>
      <img src="${imageUrl}" alt="${personaje.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
      <div class="info">
        <h2>${personaje.name}</h2>
        <p><strong>Género:</strong> ${traducirGenero(personaje.gender)}</p>
      </div>
    `;
    charactersGrid.appendChild(card);
  });
}

// Renderizo los episodios
function renderEpisodes(episodios) {
  episodesGrid.innerHTML = '';
  episodios.forEach(episodio => {
    let card = document.createElement('article');
    card.classList.add('character-card');
    card.dataset.id = episodio.id;
    card.dataset.type = "episode"; // Etiqueto la tarjeta para el Modal
    
    let imageUrl = `https://cdn.thesimpsonsapi.com/200/episode/${episodio.id}.webp`;
    let titulo = episodio.name || 'Episodio sin título';
    
    card.innerHTML = `
      <img src="${imageUrl}" alt="${titulo}" onerror="this.src='https://via.placeholder.com/200?text=Episodio'">
      <div class="info">
        <h2>${titulo}</h2>
        <p><strong>Episodio:</strong> ${episodio.episode_number || 'N/A'}</p>
        <p><strong>Temporada:</strong> ${episodio.season || 'N/A'}</p>
        <p><strong>Emisión:</strong> ${episodio.airdate || 'Desconocida'}</p>
      </div>
    `;
    episodesGrid.appendChild(card);
  });
}

// Renderizo los favoritos
function renderFavorites() {
  favoritesGrid.innerHTML = '';
  if (favorites.length === 0) {
    noFavsMsg.classList.remove('hidden');
  } else {
    noFavsMsg.classList.add('hidden');
    favorites.forEach(personaje => {
      let card = document.createElement('article');
      card.classList.add('character-card');
      card.dataset.id = personaje.id;
      card.dataset.type = "character"; 

      let imageUrl = `https://cdn.thesimpsonsapi.com/200/character/${personaje.id}.webp`;

      card.innerHTML = `
        <button class="btn-fav is-fav" data-id="${personaje.id}">💛</button>
        <img src="${imageUrl}" alt="${personaje.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
        <div class="info">
          <h2>${personaje.name}</h2>
          <p><strong>Estado:</strong> ${traducirEstado(personaje.status)}</p>
        </div>
      `;
      favoritesGrid.appendChild(card);
    });
  }
}

// FILTROS Y PAGINACIÓN

function applyFilters() {
  let searchTerm = inputSearch.value.toLowerCase();
  
  // Filtrar Personajes
  let statusTerm = selectStatus.value.toLowerCase(); // Vivo o Muerto
  let genderTerm = selectGender.value; // Male, Female

  let charsFiltrados = allCharacters.filter(p => {
    let safeName = (p.name || "").toLowerCase();
    let safeStatus = (p.status || "").toLowerCase();
    let safeGender = p.gender || "";

    let nameMatch = safeName.includes(searchTerm);
    let statusMatch = statusTerm === "" || safeStatus === statusTerm;
    let genderMatch = genderTerm === "" || safeGender === genderTerm;

    // Devuelve true si cumple los 3 filtros
    return nameMatch && statusMatch && genderMatch;
  });
  renderCharacters(charsFiltrados);

  // Filtrar Episodios
  let seasonTerm = selectSeason.value; // 1,2,3
  let epsFiltrados = allEpisodes.filter(ep => {
    let safeName = (ep.name || ep.title || "").toLowerCase();
    let safeSeason = (ep.season || "").toString();
    return safeName.includes(searchTerm) && (seasonTerm === "" || safeSeason === seasonTerm);
  });
  renderEpisodes(epsFiltrados);
}

// Escuchadores de eventos de inputs o cambio en el selector
inputSearch.addEventListener('input', applyFilters);
selectStatus.addEventListener('change', applyFilters);
selectSeason.addEventListener('change', applyFilters);
selectGender.addEventListener('change', applyFilters);

// Botones de Cargar Más personajes y episodios
btnLoadMore.addEventListener('click', () => {
    currentPageChars++;
    fetchCharacters(currentPageChars);
});

btnLoadMoreEpisodes.addEventListener('click', () => {
    currentPageEps++;
    fetchEpisodes(currentPageEps);
});

// LOCALSTORAGE Y MODAL
// Escucha los clicks
document.addEventListener('click', (event) => {
  // Favoritos
  if (event.target.classList.contains('btn-fav')) {
    event.stopPropagation(); 
    let characterId = parseInt(event.target.dataset.id);
    let personajeCompleto = allCharacters.find(p => p.id === characterId) || favorites.find(p => p.id === characterId);

    let index = favorites.findIndex(fav => fav.id === characterId);
    if (index === -1) {
      favorites.push(personajeCompleto); 
      event.target.textContent = '💛';
      event.target.classList.add('is-fav');
    } else {
      favorites.splice(index, 1); 
      event.target.textContent = '🤍';
      event.target.classList.remove('is-fav');
    }

    localStorage.setItem('simpsons_favs', JSON.stringify(favorites));
    if (!document.querySelector('#tab-favorites').classList.contains('hidden')) renderFavorites();
  }

  // Modal
  let cardClicada = event.target.closest('.character-card');
  if (cardClicada && !event.target.classList.contains('btn-fav')) {
    let id = parseInt(cardClicada.dataset.id);
    let tipo = cardClicada.dataset.type;

    if(!id) return; 

    // Si hago click en un personaje
    if (tipo === 'character') {
      let personaje = allCharacters.find(p => p.id === id) || favorites.find(p => p.id === id);
      let imageUrl = `https://cdn.thesimpsonsapi.com/200/character/${personaje.id}.webp`;

      modalInfo.innerHTML = `
        <img src="${imageUrl}" alt="${personaje.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'" style="width:150px; border: 3px solid #58a6ff; border-radius: 10px; margin-bottom: 1rem;">
        <h2>${personaje.name || 'Desconocido'}</h2>
        <br>
        <p><strong>Género:</strong> ${traducirGenero(personaje.gender)}</p>
        <p><strong>Estado Vital:</strong> ${traducirEstado(personaje.status)}</p>
        <p><strong>Edad:</strong> ${personaje.age || 'Desconocida'}</p>
        <p><strong>Fecha Nacimiento:</strong> ${personaje.birthdate || 'Desconocida'}</p>
      `;
    } 
      // Si hago click en un episodio
    else if (tipo === 'episode') {
      let episodio = allEpisodes.find(e => e.id === id);
      let imageUrl = `https://cdn.thesimpsonsapi.com/200/episode/${episodio.id}.webp`;

      modalInfo.innerHTML = `
        <img src="${imageUrl}" alt="${episodio.name}" onerror="this.src='https://via.placeholder.com/200?text=Episodio'" style="width:150px; border: 3px solid #58a6ff; border-radius: 10px; margin-bottom: 1rem;">
        <h2 style="font-size: 1.3rem;">${episodio.name || 'Desconocido'}</h2>
        <br>
        <p><strong>Temporada:</strong> ${episodio.season || 'N/A'}</p>
        <p><strong>Episodio:</strong> ${episodio.episode_number || 'N/A'}</p>
        <p><strong>Fecha Emisión:</strong> ${episodio.airdate || 'Desconocida'}</p>
        <p style="margin-top: 1rem; text-align: justify; font-size: 0.9rem; border-top: 1px solid #58a6ff; padding-top: 0.5rem;"><strong>Sinopsis:</strong> ${episodio.synopsis || 'Sin descripción disponible.'}</p>
      `;
    }
      
  modal.classList.remove('hidden'); 
  }
});

// Cerrar el modal
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });

// ----------------------
// BOTÓN DE SCROLL ARRIBA
// ----------------------

// Capturamos el botón
let btnScrollTop = document.querySelector('#btn-scroll-top');

// Mostrar/Ocultar el botón al hacer scroll en la ventana
window.addEventListener('scroll', () => {
  // window.scrollY para ver cuanto hemos bajado scroll
  if (window.scrollY > 300) {
    // Si bajamos más de 300px, le quitamos el hidden para que se vea
    btnScrollTop.classList.remove('hidden');
  } else {
    // Si estamos arriba del todo, lo ocultamos
    btnScrollTop.classList.add('hidden');
  }
});

// Subir al hacer clic
btnScrollTop.addEventListener('click', () => {
  // window.scrollTo hace scroll hasta un punto
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});


// ----------------
// ARRANQUE INICIAL
// ----------------
fetchCharacters(currentPageChars);
fetchEpisodes(currentPageEps);

