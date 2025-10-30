/**
 * Frontend SPA (Vanilla TS + Tailwind)
 * Build: tsc -> dist/main.js ; tailwindcss -> dist/style.css
 */

/* ---------- Types & state ---------- */
type Page = 'home' | 'versus' | 'tournament';
const MAX_TOURNAMENT_PLAYERS = 8;
const app = document.getElementById('app')!;

const appState = { players: [] as string[] };

/* ---------- Helpers ---------- */
function elFromHTML(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement;
}
function navigateTo(page: Page) { window.location.hash = `#${page}`; }
function getHashPage(): Page { const h = (window.location.hash || '#home').replace('#','') as Page; if (h !== 'home' && h !== 'versus' && h !== 'tournament') return 'home'; return h; }

/* ---------- Renderers ---------- */
function render(page: Page) {
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'card';
  container.appendChild(header());
  const main = document.createElement('main');
  main.className = 'mt-6';
  if (page === 'home') main.appendChild(homeContent());
  if (page === 'versus') main.appendChild(versusContent());
  if (page === 'tournament') main.appendChild(tournamentContent());
  container.appendChild(main);
  const footer = elFromHTML(`<footer class="mt-6 small text-center">Petit MVP • Vanilla TS + Tailwind</footer>`);
  container.appendChild(footer);
  app.appendChild(container);
}

function header(): HTMLElement {
  const html = `
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">MVP — Mode de jeu</h1>
        <p class="small mt-1">Choisis un mode puis sélectionne les pseudos.</p>
      </div>
      <div class="small">Critère en haut</div>
    </header>
  `;
  return elFromHTML(html);
}

/* Home */
function homeContent(): HTMLElement {
  const html = `
    <section class="mt-6 flex flex-col gap-6 items-center">
      <div class="w-full flex flex-col sm:flex-row gap-4">
        <button id="btn-versus" class="btn flex-1 border bg-white">Versus local</button>
        <button id="btn-tournament" class="btn flex-1 bg-slate-800 text-white">Tournois</button>
      </div>
      <div class="w-full text-center small">Sélectionne un mode pour commencer.</div>
    </section>
  `;
  const node = elFromHTML(html);
  node.querySelector('#btn-versus')!.addEventListener('click', () => navigateTo('versus'));
  node.querySelector('#btn-tournament')!.addEventListener('click', () => navigateTo('tournament'));
  return node;
}

/* Versus */
function versusContent(): HTMLElement {
  const html = `
    <section>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-medium">Versus (2 joueurs)</h2>
        <button id="back" class="small">← Retour</button>
      </div>
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col">
          <span class="small">Joueur 1</span>
          <input id="p1" placeholder="Pseudo du joueur 1" class="mt-1 p-3 rounded-lg border" />
        </label>
        <label class="flex flex-col">
          <span class="small">Joueur 2</span>
          <input id="p2" placeholder="Pseudo du joueur 2" class="mt-1 p-3 rounded-lg border" />
        </label>
      </div>
      <div class="mt-4 flex gap-3">
        <button id="rand" class="btn border bg-white">Remplir aléatoire</button>
        <button id="start" class="ml-auto btn text-white bg-indigo-600">Démarrer</button>
      </div>
    </section>
  `;
  const node = elFromHTML(html);
  const back = node.querySelector('#back') as HTMLButtonElement;
  const p1 = node.querySelector('#p1') as HTMLInputElement;
  const p2 = node.querySelector('#p2') as HTMLInputElement;
  const rand = node.querySelector('#rand') as HTMLButtonElement;
  const start = node.querySelector('#start') as HTMLButtonElement;

  back.addEventListener('click', () => navigateTo('home'));
  rand.addEventListener('click', () => {
    const samples = ['Alice','Bob','Charlie','Denis','Eve','Fox'];
    const a = samples[Math.floor(Math.random()*samples.length)];
    let b = samples[Math.floor(Math.random()*samples.length)];
    while (b === a) b = samples[Math.floor(Math.random()*samples.length)];
    p1.value = a; p2.value = b;
  });
  start.addEventListener('click', async () => {
    const a = p1.value.trim(); const b = p2.value.trim();
    if (!a || !b || a === b) { alert('Les pseudos doivent être différents et non vides'); return; }
    appState.players = [a,b];
    localStorage.setItem('mvp_players', JSON.stringify(appState.players));
    try {
      await fetch('/api/start-tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: appState.players })
      });
    } catch(e) { console.warn('API call failed', e); }
    alert(`Démarrage Versus: ${a} vs ${b}`);
  });

  return node;
}

/* Tournament */
function tournamentContent(): HTMLElement {
  const html = `
    <section>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-medium">Tournoi (max ${MAX_TOURNAMENT_PLAYERS} joueurs)</h2>
        <button id="back" class="small">← Retour</button>
      </div>
      <div id="slots" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"></div>
      <div class="mt-4 flex gap-3">
        <button id="fill" class="btn border bg-white">Remplir exemples</button>
        <button id="clear" class="btn border bg-white">Effacer</button>
        <div class="ml-auto flex items-center gap-3">
          <div class="small">Joueurs prêts: <strong id="count">0</strong></div>
          <button id="start" class="btn text-white bg-green-600">Démarrer</button>
        </div>
      </div>
      <p class="small mt-3">Il faut au moins 2 joueurs pour lancer un tournoi.</p>
    </section>
  `;
  const node = elFromHTML(html);
  const back = node.querySelector('#back') as HTMLButtonElement;
  const slots = node.querySelector('#slots') as HTMLElement;
  const fill = node.querySelector('#fill') as HTMLButtonElement;
  const clear = node.querySelector('#clear') as HTMLButtonElement;
  const countEl = node.querySelector('#count') as HTMLElement;
  const start = node.querySelector('#start') as HTMLButtonElement;

  back.addEventListener('click', () => navigateTo('home'));

  for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
    const slot = elFromHTML(`
      <div class="p-2 border rounded-lg bg-slate-50">
        <div class="small text-slate-500">Slot ${i+1}</div>
        <input id="player-${i}" placeholder="Pseudo #${i+1}" class="w-full mt-2 p-2 rounded-md border" />
      </div>
    `);
    slots.appendChild(slot);
    const input = slot.querySelector('input') as HTMLInputElement;
    input.addEventListener('input', updateCount);
  }

  function readPlayers(): string[] {
    const arr: string[] = [];
    for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
      const el = document.getElementById(`player-${i}`) as HTMLInputElement | null;
      if (!el) continue;
      const v = el.value.trim();
      if (v.length > 0) arr.push(v);
    }
    return arr;
  }

  function updateCount() {
    const players = readPlayers();
    countEl.textContent = String(players.length);
  }

  fill.addEventListener('click', () => {
    const samples = ['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel'];
    for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
      const el = document.getElementById(`player-${i}`) as HTMLInputElement | null;
      if (el) el.value = samples[i] || '';
    }
    updateCount();
  });

  clear.addEventListener('click', () => {
    for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
      const el = document.getElementById(`player-${i}`) as HTMLInputElement | null;
      if (el) el.value = '';
    }
    updateCount();
  });

  start.addEventListener('click', async () => {
    const players = readPlayers();
    if (players.length < 2) { alert('Il faut au moins 2 joueurs'); return; }
    appState.players = players;
    localStorage.setItem('mvp_players', JSON.stringify(players));
    try {
      await fetch('/api/start-tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players })
      });
    } catch(e) { console.warn('API call failed', e); }
    alert('Tournoi démarré: ' + players.join(', '));
  });

  updateCount();
  return node;
}

/* Init routing */
window.addEventListener('hashchange', () => render(getHashPage()));
render(getHashPage());
