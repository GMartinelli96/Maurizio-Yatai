import { FRAME_MS } from './config.js';
import { getLanguage } from './i18n.js';

// Gli hook che usano i test Playwright (scripts/playtest.mjs).
//
// window.advanceTime(ms): al primo uso ferma il ciclo del browser e da lì in poi il tempo
// avanza solo quando lo chiede il test, a passi fissi da 1/60 s. Così ogni prova è ripetibile.
//
// window.render_game_to_text(): lo stato del gioco in JSON. Ogni scena può aggiungere il suo
// definendo getTextState(); il JSON deve bastare per giocare senza guardare lo schermo.
export function installTestHooks(game) {
  let manual = false;
  let time = 0;

  window.advanceTime = (ms) => {
    if (!manual) {
      game.loop.sleep();
      manual = true;
      time = game.loop.time;
    }
    const frames = Math.max(1, Math.round(ms / FRAME_MS));
    for (let i = 0; i < frames; i++) {
      time += FRAME_MS;
      game.step(time, FRAME_MS);
    }
  };

  window.render_game_to_text = () => {
    const scene = game.scene.getScenes(true).at(-1);
    return JSON.stringify({
      scene: scene?.sys.settings.key ?? null,
      lang: getLanguage(),
      timeMs: Math.round(scene?.time.now ?? 0),
      manualTime: manual,
      gioco: { w: game.scale.width, h: game.scale.height },
      ...scene?.getTextState?.(),
    });
  };
}
