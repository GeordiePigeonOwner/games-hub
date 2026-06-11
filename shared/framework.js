// Shared minigame framework — timer, state machine, best-time storage.
// Each game creates a GameController, wires its own render/lifecycle hooks.

(function (global) {
  'use strict';

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (Math.floor(totalSeconds) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ---- Timer ----
  // opts: { display, limitSeconds, onTick, onExpire }
  //   display: HTMLElement to update (or null)
  //   limitSeconds: 0 = count up; >0 = countdown with auto-expire
  function createTimer(opts) {
    let startTime = 0;
    let elapsed = 0;
    let interval = null;
    const display = opts.display;
    const limit = opts.limitSeconds || 0;

    function render() {
      if (!display) return;
      if (limit > 0) {
        const remaining = Math.max(0, limit - elapsed);
        display.textContent = formatTime(remaining);
        display.style.color = remaining <= 10 ? 'var(--danger)' : 'var(--accent)';
      } else {
        display.textContent = formatTime(elapsed);
        display.style.color = 'var(--accent)';
      }
    }

    function start() {
      stop();
      startTime = Date.now();
      elapsed = 0;
      render();
      interval = setInterval(() => {
        elapsed = Math.floor((Date.now() - startTime) / 1000);
        render();
        if (opts.onTick) opts.onTick(elapsed);
        if (limit > 0 && elapsed >= limit) {
          stop();
          if (opts.onExpire) opts.onExpire();
        }
      }, 250);
    }

    function stop() {
      if (interval) { clearInterval(interval); interval = null; }
    }

    function reset() {
      stop();
      elapsed = 0;
      render();
    }

    return {
      start, stop, reset,
      get elapsed() { return elapsed; },
    };
  }

  // ---- Best time / records ----
  // Keyed by gameId; stores { bestSeconds, wins, lastPlayed, config }
  const STORAGE_KEY = 'gamesCreation.records.v1';

  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function saveRecords(recs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recs)); } catch {}
  }

  // Returns the best record across all config variants for a game.
  // { bestSeconds, wins, lastPlayed } or null.
  function getRecord(gameId) {
    const all = loadRecords();
    const prefix = gameId + ':';
    let best = null;
    let totalWins = 0;
    let lastPlayed = 0;
    for (const key of Object.keys(all)) {
      if (key !== gameId && !key.startsWith(prefix)) continue;
      const r = all[key];
      totalWins += r.wins || 0;
      if (r.lastPlayed && r.lastPlayed > lastPlayed) lastPlayed = r.lastPlayed;
      if (r.bestSeconds != null && (best == null || r.bestSeconds < best)) {
        best = r.bestSeconds;
      }
    }
    if (totalWins === 0 && best == null) return null;
    return { bestSeconds: best, wins: totalWins, lastPlayed };
  }

  // Raw per-config lookup if a game needs it.
  function getRecordForConfig(gameId, configKey) {
    const all = loadRecords();
    const key = configKey ? `${gameId}:${configKey}` : gameId;
    return all[key] || null;
  }

  // Record a win. seconds = solve time, configKey optional so you can keep
  // separate best times per difficulty (e.g. "colors=5,holes=5").
  function recordWin(gameId, seconds, configKey) {
    const all = loadRecords();
    const key = configKey ? `${gameId}:${configKey}` : gameId;
    const existing = all[key] || { wins: 0 };
    const isNewBest = existing.bestSeconds == null || seconds < existing.bestSeconds;
    all[key] = {
      bestSeconds: isNewBest ? seconds : existing.bestSeconds,
      wins: (existing.wins || 0) + 1,
      lastPlayed: Date.now(),
    };
    saveRecords(all);
    return { isNewBest, bestSeconds: all[key].bestSeconds };
  }

  // ---- Back-to-menu link ----
  // Inject a small "← Menu" link at the top-left of any game page.
  // Relies on the file structure: GamesCreation/<game>/index.html and GamesCreation/index.html
  function injectBackLink(href) {
    const link = document.createElement('a');
    link.className = 'back-link';
    link.href = href || '../index.html';
    link.textContent = '← Menu';
    document.body.appendChild(link);
  }

  // ---- Public API ----
  global.GameFramework = {
    formatTime,
    createTimer,
    getRecord,
    getRecordForConfig,
    recordWin,
    loadRecords,
    injectBackLink,
  };
})(window);
