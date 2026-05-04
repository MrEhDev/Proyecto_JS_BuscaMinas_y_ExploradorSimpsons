import"./main-CMjvGjll.js";var e=document.querySelectorAll(`.tab-btn`),t=document.querySelectorAll(`.view-section`),n=document.querySelector(`#characters-grid`),r=document.querySelector(`#episodes-grid`),i=document.querySelector(`#favorites-grid`),a=document.querySelector(`#loading-msg`),o=document.querySelector(`#loading-ep-msg`),s=document.querySelector(`#no-favs-msg`),c=document.querySelector(`#btn-load-more`),l=document.querySelector(`#btn-load-more-episodes`),u=document.querySelector(`#input-search`),d=document.querySelector(`#select-status`),f=document.querySelector(`#select-gender`),p=document.querySelector(`#select-season`),m=document.querySelector(`#character-modal`),h=document.querySelector(`#modal-info`),g=document.querySelector(`.close-btn`),_=`https://thesimpsonsapi.com/api/characters`,v=`https://thesimpsonsapi.com/api/episodes`,y=[],b=[],x=JSON.parse(localStorage.getItem(`simpsons_favs`))||[],S=1,C=1;function w(e){if(!e)return`Desconocido`;let t=e.toLowerCase();return t===`alive`?`Vivo`:t===`deceased`?`Muerto`:e}function T(e){if(!e)return`Desconocido`;let t=e.toLowerCase();return t===`male`?`Hombre 🚹`:t===`female`?`Mujer 🚺`:e}e.forEach(n=>{n.addEventListener(`click`,n=>{e.forEach(e=>e.classList.remove(`active`)),t.forEach(e=>e.classList.add(`hidden`));let r=n.target;r.classList.add(`active`);let i=r.dataset.tab;document.querySelector(`#${i}`).classList.remove(`hidden`),i===`tab-episodes`?(d.classList.add(`hidden`),f.classList.add(`hidden`),p.classList.remove(`hidden`)):(d.classList.remove(`hidden`),f.classList.remove(`hidden`),p.classList.add(`hidden`)),j(),i===`tab-favorites`&&A()})});async function E(e=1){try{e>1&&(a.textContent=`Trayendo más personajes de Springfield... 🍩`,a.style.display=`block`,c.classList.add(`hidden`),await new Promise(e=>setTimeout(e,1e3)));let t=await(await fetch(`${_}?page=${e}`)).json();y=[...y,...t.results],a.style.display=`none`,c.classList.remove(`hidden`),j()}catch(e){console.error(`Error al cargar personajes:`,e),a.textContent=`Error al traer los personajes.`}}async function D(e=1){try{e>1&&(o.textContent=`Buscando más episodios en la base de datos... 📼`,o.style.display=`block`,l.classList.add(`hidden`),await new Promise(e=>setTimeout(e,1e3)));let t=await(await fetch(`${v}?page=${e}`)).json(),n=t.results||t.data||t;Array.isArray(n)&&(b=[...b,...n],o.style.display=`none`,l.classList.remove(`hidden`),j())}catch(e){console.error(`Error al cargar episodios:`,e)}}function O(e){n.innerHTML=``,e.forEach(e=>{let t=x.some(t=>t.id===e.id),r=document.createElement(`article`);r.classList.add(`character-card`),r.dataset.id=e.id,r.dataset.type=`character`;let i=`https://cdn.thesimpsonsapi.com/200/character/${e.id}.webp`;r.innerHTML=`
      <button class="btn-fav ${t?`is-fav`:``}" data-id="${e.id}">
        ${t?`💛`:`🤍`}
      </button>
      <img src="${i}" alt="${e.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
      <div class="info">
        <h2>${e.name}</h2>
        <p><strong>Género:</strong> ${T(e.gender)}</p>
      </div>
    `,n.appendChild(r)})}function k(e){r.innerHTML=``,e.forEach(e=>{let t=document.createElement(`article`);t.classList.add(`character-card`),t.dataset.id=e.id,t.dataset.type=`episode`;let n=`https://cdn.thesimpsonsapi.com/200/episode/${e.id}.webp`,i=e.name||`Episodio sin título`;t.innerHTML=`
      <img src="${n}" alt="${i}" onerror="this.src='https://via.placeholder.com/200?text=Episodio'">
      <div class="info">
        <h2>${i}</h2>
        <p><strong>Episodio:</strong> ${e.episode_number||`N/A`}</p>
        <p><strong>Temporada:</strong> ${e.season||`N/A`}</p>
        <p><strong>Emisión:</strong> ${e.airdate||`Desconocida`}</p>
      </div>
    `,r.appendChild(t)})}function A(){i.innerHTML=``,x.length===0?s.classList.remove(`hidden`):(s.classList.add(`hidden`),x.forEach(e=>{let t=document.createElement(`article`);t.classList.add(`character-card`),t.dataset.id=e.id,t.dataset.type=`character`;let n=`https://cdn.thesimpsonsapi.com/200/character/${e.id}.webp`;t.innerHTML=`
        <button class="btn-fav is-fav" data-id="${e.id}">💛</button>
        <img src="${n}" alt="${e.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
        <div class="info">
          <h2>${e.name}</h2>
          <p><strong>Estado:</strong> ${w(e.status)}</p>
        </div>
      `,i.appendChild(t)}))}function j(){let e=u.value.toLowerCase(),t=d.value.toLowerCase(),n=f.value;O(y.filter(r=>{let i=(r.name||``).toLowerCase(),a=(r.status||``).toLowerCase(),o=r.gender||``;return i.includes(e)&&(t===``||a===t)&&(n===``||o===n)}));let r=p.value;k(b.filter(t=>{let n=(t.name||t.title||``).toLowerCase(),i=(t.season||``).toString();return n.includes(e)&&(r===``||i===r)}))}u.addEventListener(`input`,j),d.addEventListener(`change`,j),p.addEventListener(`change`,j),f.addEventListener(`change`,j),c.addEventListener(`click`,()=>{S++,E(S)}),l.addEventListener(`click`,()=>{C++,D(C)}),document.addEventListener(`click`,e=>{if(e.target.classList.contains(`btn-fav`)){e.stopPropagation();let t=parseInt(e.target.dataset.id),n=y.find(e=>e.id===t)||x.find(e=>e.id===t),r=x.findIndex(e=>e.id===t);r===-1?(x.push(n),e.target.textContent=`💛`,e.target.classList.add(`is-fav`)):(x.splice(r,1),e.target.textContent=`🤍`,e.target.classList.remove(`is-fav`)),localStorage.setItem(`simpsons_favs`,JSON.stringify(x)),document.querySelector(`#tab-favorites`).classList.contains(`hidden`)||A()}let t=e.target.closest(`.character-card`);if(t&&!e.target.classList.contains(`btn-fav`)){let e=parseInt(t.dataset.id),n=t.dataset.type;if(!e)return;if(n===`character`){let t=y.find(t=>t.id===e)||x.find(t=>t.id===e);h.innerHTML=`
        <img src="${`https://cdn.thesimpsonsapi.com/200/character/${t.id}.webp`}" alt="${t.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'" style="width:150px; border: 3px solid #58a6ff; border-radius: 10px; margin-bottom: 1rem;">
        <h2>${t.name||`Desconocido`}</h2>
        <br>
        <p><strong>Género:</strong> ${T(t.gender)}</p>
        <p><strong>Estado Vital:</strong> ${w(t.status)}</p>
        <p><strong>Edad:</strong> ${t.age||`Desconocida`}</p>
        <p><strong>Fecha Nacimiento:</strong> ${t.birthdate||`Desconocida`}</p>
      `}else if(n===`episode`){let t=b.find(t=>t.id===e);h.innerHTML=`
        <img src="${`https://cdn.thesimpsonsapi.com/200/episode/${t.id}.webp`}" alt="${t.name}" onerror="this.src='https://via.placeholder.com/200?text=Episodio'" style="width:150px; border: 3px solid #58a6ff; border-radius: 10px; margin-bottom: 1rem;">
        <h2 style="font-size: 1.3rem;">${t.name||`Desconocido`}</h2>
        <br>
        <p><strong>Temporada:</strong> ${t.season||`N/A`}</p>
        <p><strong>Episodio:</strong> ${t.episode_number||`N/A`}</p>
        <p><strong>Fecha Emisión:</strong> ${t.airdate||`Desconocida`}</p>
        <p style="margin-top: 1rem; text-align: justify; font-size: 0.9rem; border-top: 1px solid #58a6ff; padding-top: 0.5rem;"><strong>Sinopsis:</strong> ${t.synopsis||`Sin descripción disponible.`}</p>
      `}m.classList.remove(`hidden`)}}),g.addEventListener(`click`,()=>m.classList.add(`hidden`)),m.addEventListener(`click`,e=>{e.target===m&&m.classList.add(`hidden`)});var M=document.querySelector(`#btn-scroll-top`);window.addEventListener(`scroll`,()=>{window.scrollY>300?M.classList.remove(`hidden`):M.classList.add(`hidden`)}),M.addEventListener(`click`,()=>{window.scrollTo({top:0,behavior:`smooth`})}),E(S),D(C);