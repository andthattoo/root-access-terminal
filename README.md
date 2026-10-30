# Root Access — Terminal Playground

A standalone ASCII hacking toy by Baylel Games.

**[Play in your browser](https://terminal.andthattoo.dev/)**

Select one of six jobs from the left menu, then type with any regular keyboard key
or hold HACK. Each job has a unique chain of 3–5 targets. Compose CLI commands,
inspect ports, type sandbox code patches, and breach each target in sequence.
Commands execute on their final keystroke, with no execution or transition waits.
After payment, the next input starts typing in the next contract immediately.
Harder jobs require more input and targets.

Switching jobs pauses and preserves unfinished progress for the browser session.
Completed jobs can be replayed. The on-screen HACK button supports mouse and touch.
Browser shortcuts and Tab navigation keep their normal behavior.

The game fits the viewport. The terminal shows up to 12 recent outputs, trimming
older lines to fit the available space while keeping the prompt and HACK visible.

No installation, account, dependencies or backend. Reloading starts a fresh
session. This prototype is separate from the Root Access Unity game.

## Hosting

The primary site is hosted on Cloudflare Workers Static Assets as
`root-access-terminal`, with the custom domain `terminal.andthattoo.dev`.
The fallback Cloudflare address is
https://root-access-terminal.omer-kaya.workers.dev/.

This repository stores the source. To publish on Cloudflare, upload the four
root assets (`index.html`, `style.css`, `app.js`, `game.js`) to that Worker.
GitHub pushes do not currently deploy to Cloudflare automatically.

The existing GitHub Pages mirror still serves `main`; `.nojekyll` keeps it a
plain static site. All asset URLs are relative.

All code shown in the terminal is fictional visual feedback.

Run the gameplay checks with `node --test tests/game.test.mjs` (Node 24+).
