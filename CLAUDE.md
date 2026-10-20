# Cockpit — contesto per Claude

Web app stile CarPlay per lo scooter **BMW C 400 GT** di Antonio, usata su **iPhone Air in orizzontale**
(912×420 pt, 3x, Dynamic Island a sinistra: angolo 90°) come app aggiunta alla Home.
Online: https://antocanciello.github.io/Cockpit/ — GitHub Pages pubblica `main` da questa repo.

## Come lavorare con Antonio
- **Rispondere sempre in italiano**, in modo semplice (non è uno sviluppatore).
- Per scelte di design / colori / grafica: **prima 3 proposte visive** (screenshot) e aspettare la scelta.
- Dopo ogni modifica: alzare la versione, provare, fare commit e push su `main`, poi dire in breve cosa cambia.
- Lui prova sul telefono mentre guida e manda screenshot o registrazioni dello schermo: misurare dai fotogrammi
  (ffmpeg + Python/PIL) invece di andare a intuito. Così sono stati tarati i tempi dell'isola dinamica.
- **Sicurezza**: la chiave TomTom e l'indirizzo del trigger Alexa stanno **solo nel localStorage del telefono**.
  Non scriverli mai nel codice, nei commit o nei messaggi. Non mandare la sua email a servizi esterni.

## File
- `index.html` — **tutta l'app** (HTML + CSS + JS in un file, ~3500 righe). Niente build.
- `sw.js` — service worker: la pagina parte dalla memoria del telefono (niente lampo bianco); con `?v=` passa dalla rete.
- `manifest.webmanifest`, `icon-*.png`, `bmw-logo.png` (barra), `bmw-logo-white.png` (introduzione),
  `splash/*.png` (schermate di lancio iOS), `awake.mp4/webm` (video invisibile anti-standby).
- `tests/` — prove Playwright (vedi `tests/README.md`).

## Versione e aggiornamento
- Stringa `2026-10-19 vNNN` presente **3 volte** in `index.html` (meta `cockpit-version`, `#bootVer`, `#verLabel`):
  alzarle tutte insieme (`sed -i 's/2026-10-19 v135/2026-10-19 v136/g' index.html`).
- L'app controlla la versione online e si ricarica da sola (mai durante la navigazione).
- Se cambiano file in cache, alzare anche `CACHE` in `sw.js`.

## Architettura (index.html)
- `#stage` (classi di stato: `land`, `short` <440 pt, `island-l/r`, `isl-l/r` riquadri allargati attorno all'isola,
  `lefty` modalità mancino, `editing` matita, `rotating`, `glass-*`, `walled`) → `#app[data-mode=home|map|radio|contacts]`
  → `.rail` (barra pulsanti) + `main` (griglia: `#pMap`, `#pContacts` meteo/calendario/contatti, `#pRadio`).
- Impostazioni in `localStorage['cockpit.v1']` (`cfg`, salvate con `save()`); altre chiavi `cockpit.*`
  (lastpos, recent, logos, diag = scatola nera, cpage, wx, streams, islsafe, islside, setsec).
- **Mappa**: MapLibre GL 4.7.1. Giorno: raster TomTom. Notte: vettoriale OpenFreeMap con 3 palette (`NIGHT`).
  Traffico TomTom con filtro canvas (`ctraffic`).
- **Navigazione**: percorsi TomTom (traffico, alternative) con Valhalla di riserva; `navUpdate` aggancia la posizione
  al percorso con limiti legati alla precisione GPS, ricalcola fuori percorso, `trimRoute` cancella il tratto fatto.
  In orizzontale la freccia sta al 60% della larghezza.
- **Radio**: catalogo `RADIO_IT`, più indirizzi per stazione con failover e ricerca su radio-browser; onda animata
  su canvas (non legata all'audio: iOS lo vieta tra siti diversi).
- **Isola dinamica** (solo orizzontale, iPhone con isola): il lato accanto all'isola si allarga fino al bordo con un
  incavo (clip-path calcolato in JS, contorno SVG). L'incavo si allunga con la radio con tempi misurati dai video:
  primo play = all'arrivo dei dati dello stream + 0,18 s; play successivi = tocco + 0,04 s; dopo la pausa 5,05 s.
  Isola: x 20, larga 37, corta 126 pt, lunga 185 pt. Rotazione: lato e margine ricordati, così le forme sono pronte.
- **Matita** (Home in orizzontale): maniglia sul divisorio per la larghezza dei riquadri (`cfg.sideW`), ripristino.
- **Pulsante Casa** (swipe in su sulla radio): chiama l'indirizzo del trigger Alexa (`cfg.actUrl`, fetch no-cors,
  pulsante verde/rosso per 1 s) oppure il comando dell'app Comandi (`cfg.actName`).
- Animazioni con `setShown(el, show, kind)` (WAAPI) e `motion()` che rispetta «Riduci movimento».

## Prove
```bash
cd tests && npm install && node gt25.mjs
```
Le prove simulano rete, GPS e isola dinamica; per vedere il risultato guardare gli screenshot che salvano.
Sul telefono rispondono `Impostazioni → Info → Copia diario` (scatola nera con GPS, radio, isola, ricalcoli).

## Commit
Messaggi in italiano, brevi, che dicono cosa cambia per chi usa l'app. Push diretto su `main`.
