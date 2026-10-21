# Prove automatiche del Cockpit

Ogni file `.mjs` apre `../index.html` in Chromium headless (Playwright), simula il telefono
(dimensioni, orientamento, GPS, rete) e stampa cosa succede; alcune salvano screenshot `.png` qui.
Tutte le chiamate di rete sono finte (`page.route`): nessuna prova usa internet né chiavi vere.

```bash
cd tests && npm install          # playwright 1.47.2 + maplibre-gl 4.7.1 (servito alle prove di navigazione)
node gt25.mjs                    # regressione generale (rotazioni, pulsanti, errori)
```

Chromium: le prove usano `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (quello preinstallato negli
ambienti cloud di Claude Code). Su un altro computer cambiare `executablePath`.

| Prova | Cosa controlla |
|---|---|
| gt25 | regressione: avvio, rotazioni, scroll della pagina, pulsanti della barra |
| t26 | navigazione completa con percorsi TomTom finti (`node t26.mjs 912x420` per l'orizzontale) |
| t27 | prova lunga (6 min): galleria, salti GPS, segnale sporco, rete assente, uscita dal percorso, WebGL perso |
| t93 | strada parallela a 24 m dal percorso: deve partire il ricalcolo |
| t33, t56, t76 | contatti: apertura/chiusura, scorrimento a 3 righe, telefono nell'angolo della radio |
| t36 | impostazioni |
| t45, t58, t73 | radio: play/pausa, pagina «Casa» con swipe verticale, tempi dell'incavo dell'isola |
| t66, t67 | modalità mancino |
| t68, t72, t88 | isola dinamica: forme attorno all'isola, cambi di schermata, pulsante di ripristino |
| t78, t79, t85 | matita (larghezza dei riquadri), contenuti responsive, icona del meteo |
| t94, t95 | pulsante Casa con l'indirizzo del trigger Alexa (esito verde / rosso) |
| t96 | pulsante Casa con «apri l'app Alexa»: prima il trigger, poi la radio in pausa e `alexa://`; al ritorno la radio riparte (spento: nessun salto) |
| t97 | verticale: barra in fondo con angoli concentrici, pulsanti quadrati, meteo e radio in due quadrati, cornetta verde nell'angolo in basso a sinistra della mappa (contatti a tutta larghezza) |
| t98 | iPad Air 11": home, contatti, impostazioni, ricerca, matita, rotazione; pagina impaginata su ~600 punti di lato corto (×1,37), niente isola |
| t99 | marca del veicolo: iPad FIAT 500X, iPhone BMW C 400 GT (barra, introduzione, titolo); incollando le impostazioni il veicolo resta del dispositivo |

L'isola dinamica in Chromium non esiste: le prove la simulano impostando la larghezza dell'elemento
`#islProbe` (che nell'app legge `env(safe-area-inset-left/right)`).
