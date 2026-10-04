# Copenaghen · 9–13 ottobre 2026

Guida di viaggio statica, pensata per il telefono. Una pagina per ogni giorno: tappe, mappe, prezzi in euro, orari e la storia di quello che si visita.

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub (può essere pubblico).
2. Carica **tutto il contenuto di questa cartella** nella radice del repo, non in una sottocartella.
3. Su GitHub: **Settings → Pages → Build and deployment**.
4. Source: **Deploy from a branch**.
5. Branch: `main` (o `master`), cartella: `/ (root)`.
6. Salva. In uno o due minuti l’indirizzo sarà:

`https://<tuo-utente>.github.io/<nome-repo>/`

Se il sito si chiama come l’utente (`<tuo-utente>.github.io`), la home è direttamente `https://<tuo-utente>.github.io/`.

## Aprire in locale

Apri `index.html` nel browser, oppure dalla cartella:

```bash
python3 -m http.server 8080
```

Poi vai su `http://localhost:8080`.

## Pagine

| File | Contenuto |
| --- | --- |
| `index.html` | Home, voli, giorni, cosa prenotare |
| `giorno-1.html` … `giorno-5.html` | Itinerario del giorno |
| `spostamenti.html` | Metro, prezzi, City Pass |

Niente server, niente build. I prezzi usano 7,50 DKK = 1 € e vanno ricontrollati il giorno prima.
