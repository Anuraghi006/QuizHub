# QuizHub

A quiz website. React + Redux on the front, one Express server on the back.

## Folder layout

```
quiz-platform/
├── server/
│   └── index.js          ← the whole backend, one file
├── src/
│   ├── main.jsx          ← wraps the app in Provider and BrowserRouter
│   ├── App.jsx           ← the list of pages (routes)
│   ├── Components/       ← Header, ProtectedRoute
│   ├── Pages/            ← one file per page
│   └── redux/
│       ├── Store.js      ← combines all the slices
│       └── slices/       ← authSlice, quizSlice, questionSlice, attemptSlice
├── Dockerfile
└── package.json
```

Every slice follows the same pattern as your E Cart `productSlice`:
a `createAsyncThunk` calls the server with axios, and `extraReducers` puts the result in the state.

## Run it

You need Node.js 22.13 or newer. Open two terminals in this folder:

```bash
npm install        # first time only
npm run server     # terminal 1: backend on http://localhost:4000
npm run dev        # terminal 2: website on http://localhost:5173
```

Open http://localhost:5173. Log in as `admin@quiz.com` / `admin123`, or click Register.

## Build and run as one app

```bash
npm run build      # builds the website into dist/
npm start          # serves the website and the API together on http://localhost:4000
```

## Settings (environment variables)

| Name | What it does |
|---|---|
| `JWT_SECRET` | Secret used to sign login tokens. **Required when `NODE_ENV=production`.** |
| `DB_PATH` | Where the database file is saved. Defaults to `data/quiz.db`. |
| `PORT` | Server port. Defaults to `4000`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account created on first start. |

## Hosting

Use a host that supports Docker, such as Render or Railway:

1. Push the project to GitHub.
2. Create a web service from the repository. The Dockerfile is detected automatically.
3. Set `NODE_ENV=production`, `JWT_SECRET` (a long random text), `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. Set `DB_PATH` to a folder on a **persistent disk** (for example `/var/data/quiz.db`).
   Without a persistent disk, users and results are deleted every time the server restarts.

## Notes

- Questions come from the Open Trivia DB, plus any questions the admin adds.
- Correct answers stay on the server. Scoring and the timer also run on the server.
- Quizzes that are in progress are kept in the server's memory. If the server restarts during a quiz, that quiz is lost.
