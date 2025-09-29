# Avatar AI Prototype

## Installazione

Il progetto ora utilizza un'unica applicazione Express che espone le API `/chat` e distribuisce il front-end vanilla JavaScript direttamente dalla cartella `backend/public`.

### Setup

```bash
cd backend
npm install
npm start
```

Il server sarà disponibile su [http://localhost:3001](http://localhost:3001) e mostrerà l'interfaccia chat con avatar 3D.

### Variabili di ambiente

Creare un file `.env` nella cartella `backend` con:

```
OPENAI_API_KEY=la_tua_chiave
```

### Build front-end

Non è richiesta alcuna build: i file statici si trovano in `backend/public` e sono serviti direttamente da Express.
