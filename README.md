# Project Setup

- clone the repo: https://github.com/ylu021/studious-carnival.git

- install dependencies with `pnpm install`

- Run the app with `pnpm run dev`, open http://localhost:5173 to see the app

# Mobile layout testing setup

to test mobile layout, create public url for access with ngrok (or other preferable tools)
Below is a guide for mac OS, and you can read more here [ngrok docs](https://ngrok.com/downloads/mac-os)

```
brew install ngrok
ngrok http 5173
```

Note: the port 5173 is the default port for vite

Afterward make sure to replace the domain inside vite.config.ts
e.g.`xxxa.ngrok-free.app`

```
allowedHosts: [
    `inserthere`,
],
```

# Architecture

- Vite - uses native ES Modules and less boilerplate, faster start and development for project starter
- React Context + useReducer - since we are using localstorage, it's enough to use a simple, no external deps approach
- @dnd-kit - it's a popular modern typeScript supported library for draggable components

# Task Reordering

Currently reordering within a column is implemented using the array order directly, rather than an explicit `order` field. For this use case, it keeps the implementation simple and effective. Note that this approach is **not scalable**; in a larger or multi-user scenario, an `order` field would be necessary to reliably manage task positions.

# Folder structure
```
├── src/
│ ├── components/ # Components
│ ├── enhanced/ # Stretched features including HistoryLog and Keyword Filter
│ ├── context/ # State management
│ ├── types/ # TypeScript definitions
│ ├── hooks/ # Managing related Task & HistoryLog contexts
│ └── utils/ # Helper functions
```
# Time spent

4 hours
1 hour for setting up the projects + running the boilerplate
1 hour for refining the boilerplate code
1 hour for stretch goals implementations and testing
1 hour for recognizing missing requirement in step1 for move task within column and final checks
