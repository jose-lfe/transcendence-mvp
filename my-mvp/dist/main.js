"use strict";
/**
 * Minimal SPA (Vanilla TypeScript + Tailwind)
 * - page d'accueil
 * - Versus local (2 pseudos)
 * - Tournoi (max 8 pseudos)
 *
 * Routing simple via hash: #home | #versus | #tournament
 */
const MAX_TOURNAMENT_PLAYERS = 8;
const app = document.getElementById('app');
/* ---------- Helpers ---------- */
function elFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}
function navigateTo(page) {
    window.location.hash = `#${page}`;
}
function getHashPage() {
    const h = (window.location.hash || '#home').replace('#', '');
    if (h !== 'home' && h !== 'versus' && h !== 'tournament')
        return 'home';
    return h;
}
/* ---------- Renderers ---------- */
function render(page) {
    app.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6';
    container.appendChild(header());
    const main = document.createElement('main');
    main.className = 'mt-6';
    if (page === 'home')
        main.appendChild(homeContent());
    if (page === 'versus')
        main.appendChild(versusContent());
    if (page === 'tournament')
        main.appendChild(tournamentContent());
    container.appendChild(main);
    const footer = elFromHTML(`<footer class="mt-6 text-sm text-slate-500 text-center">Petit MVP • Vanilla TS + Tailwind</footer>`);
    container.appendChild(footer);
    app.appendChild(container);
}
/* Header */
function header() {
    const html = `
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">MVP — Mode de jeu</h1>
        <p class="text-sm text-slate-500 mt-1">Choisis un mode puis sélectionne les pseudos.</p>
      </div>
      <div class="text-sm text-slate-600">Critère en haut</div>
    </header>
  `;
    return elFromHTML(html);
}
/* Home */
function homeContent() {
    const html = `
    <section class="mt-6 flex flex-col gap-6 items-center">
      <div class="w-full flex flex-col sm:flex-row gap-4">
        <button id="btn-versus" class="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:shadow-md active:translate-y-0.5 transition-transform">Versus local</button>
        <button id="btn-tournament" class="flex-1 py-3 rounded-xl bg-slate-800 text-white hover:opacity-95 active:translate-y-0.5 transition-transform">Tournois</button>
      </div>
      <div class="w-full text-center text-slate-500">
        Ce MVP te permet de tester la sélection des joueurs pour un duel local ou un petit tournoi (≤ 8 joueurs).
      </div>
    </section>
  `;
    const node = elFromHTML(html);
    node.querySelector('#btn-versus').addEventListener('click', () => navigateTo('versus'));
    node.querySelector('#btn-tournament').addEventListener('click', () => navigateTo('tournament'));
    return node;
}
/* Versus (2 players) */
function versusContent() {
    const html = `
    <section>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-medium">Versus (2 joueurs)</h2>
        <button id="back" class="text-sm text-slate-500 hover:underline">← Retour</button>
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col">
          <span class="text-sm text-slate-600">Joueur 1</span>
          <input id="p1" placeholder="Pseudo du joueur 1" class="mt-1 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </label>

        <label class="flex flex-col">
          <span class="text-sm text-slate-600">Joueur 2</span>
          <input id="p2" placeholder="Pseudo du joueur 2" class="mt-1 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </label>
      </div>

      <div class="mt-4 flex gap-3">
        <button id="rand" class="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:shadow-sm">Remplir aléatoire</button>
        <button id="start" class="ml-auto px-5 py-2 rounded-lg text-white bg-indigo-300 cursor-not-allowed" disabled>Démarrer</button>
      </div>

      <p id="msg" class="mt-3 text-sm text-rose-600 hidden">Les deux pseudos doivent être différents et non vides.</p>
    </section>
  `;
    const node = elFromHTML(html);
    const back = node.querySelector('#back');
    const p1 = node.querySelector('#p1');
    const p2 = node.querySelector('#p2');
    const rand = node.querySelector('#rand');
    const start = node.querySelector('#start');
    const msg = node.querySelector('#msg');
    back.addEventListener('click', () => navigateTo('home'));
    function updateState() {
        const a = p1.value.trim();
        const b = p2.value.trim();
        const ok = a.length > 0 && b.length > 0 && a !== b;
        start.disabled = !ok;
        start.className = `ml-auto px-5 py-2 rounded-lg text-white ${ok ? 'bg-indigo-600 hover:opacity-95' : 'bg-indigo-300 cursor-not-allowed'}`;
        msg.classList.toggle('hidden', ok);
    }
    p1.addEventListener('input', updateState);
    p2.addEventListener('input', updateState);
    rand.addEventListener('click', () => {
        const samples = ['Alice', 'Bob', 'Charlie', 'Denis', 'Eve', 'Fox'];
        const a = samples[Math.floor(Math.random() * samples.length)];
        let b = samples[Math.floor(Math.random() * samples.length)];
        while (b === a)
            b = samples[Math.floor(Math.random() * samples.length)];
        p1.value = a;
        p2.value = b;
        updateState();
    });
    start.addEventListener('click', () => {
        if (start.disabled)
            return;
        alert(`Démarrage Versus: ${p1.value.trim()} vs ${p2.value.trim()}`);
    });
    updateState();
    return node;
}
/* Tournament (up to 8) */
function tournamentContent() {
    const html = `
    <section>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-medium">Tournoi (max ${MAX_TOURNAMENT_PLAYERS} joueurs)</h2>
        <button id="back" class="text-sm text-slate-500 hover:underline">← Retour</button>
      </div>

      <div id="slots" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"></div>

      <div class="mt-4 flex gap-3">
        <button id="fill" class="px-4 py-2 rounded-lg border bg-white">Remplir exemples</button>
        <button id="clear" class="px-4 py-2 rounded-lg border bg-white">Effacer</button>

        <div class="ml-auto flex items-center gap-3">
          <div class="text-sm text-slate-600">Joueurs prêts: <strong id="count">0</strong></div>
          <button id="start" class="px-5 py-2 rounded-lg text-white bg-green-300 cursor-not-allowed" disabled>Démarrer</button>
        </div>
      </div>

      <p id="hint" class="mt-3 text-sm text-slate-500">Il faut au moins 2 joueurs pour lancer un tournoi.</p>
    </section>
  `;
    const node = elFromHTML(html);
    const back = node.querySelector('#back');
    const slots = node.querySelector('#slots');
    const fill = node.querySelector('#fill');
    const clear = node.querySelector('#clear');
    const countEl = node.querySelector('#count');
    const start = node.querySelector('#start');
    back.addEventListener('click', () => navigateTo('home'));
    // create slot inputs:
    for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
        const slot = elFromHTML(`
      <div class="p-2 border border-slate-100 rounded-lg bg-slate-50">
        <div class="text-xs text-slate-500">Slot ${i + 1}</div>
        <input id="player-${i}" placeholder="Pseudo #${i + 1}" class="w-full mt-2 p-2 rounded-md border border-slate-200 focus:outline-none" />
      </div>
    `);
        slots.appendChild(slot);
        const input = slot.querySelector('input');
        input.addEventListener('input', updateCount);
    }
    function readPlayers() {
        const arr = [];
        for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
            const el = document.getElementById(`player-${i}`);
            if (!el)
                continue; // <- skip if element not present
            const v = el.value.trim();
            if (v.length > 0)
                arr.push(v);
        }
        return arr;
    }
    function updateCount() {
        const players = readPlayers();
        countEl.textContent = String(players.length);
        const ok = players.length >= 2 && players.length <= MAX_TOURNAMENT_PLAYERS;
        start.disabled = !ok;
        start.className = `px-5 py-2 rounded-lg text-white ${ok ? 'bg-green-600 hover:opacity-95' : 'bg-green-300 cursor-not-allowed'}`;
    }
    fill.addEventListener('click', () => {
        const samples = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
        for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
            document.getElementById(`player-${i}`).value = samples[i] || '';
        }
        updateCount();
    });
    clear.addEventListener('click', () => {
        for (let i = 0; i < MAX_TOURNAMENT_PLAYERS; i++) {
            document.getElementById(`player-${i}`).value = '';
        }
        updateCount();
    });
    start.addEventListener('click', () => {
        const players = readPlayers();
        if (players.length < 2)
            return;
        alert(`Démarrage Tournoi: ${players.join(', ')}`);
    });
    updateCount();
    return node;
}
/* ---------- Routing init ---------- */
window.addEventListener('hashchange', () => render(getHashPage()));
// initial render
render(getHashPage());
