# valderas.be

Well hello there, nosey nosey. Welcome to the source code of my personal site.

I'm [Inti Valderas Caro](https://valderas.be) — UX & Interaction Designer based in Belgium.

**Zero dependencies. Zero build steps. Just vibes.**

> Designed by a designer. Built by his best buddy [Claude Code](https://claude.ai/claude-code).
> No frameworks were harmed in the making of this website.
>
> *"Can you move it 2px to the left?" — Inti, mass-producing commit messages since 2025*

## Tech stack

| Layer        | Technology                |
|--------------|---------------------------|
| Framework    | None. We raw-dog HTML.    |
| CSS          | One file. 'Nuff said.     |
| JS           | Vanilla. No `node_modules` folder larger than the project itself. |
| Build tool   | The browser.              |
| CI/CD        | `git push`                |
| AI assistant | Claude Code (the real MVP)|

## What's in here

```
├── index.html             # The whole show
├── assets/
│   ├── css/style.css      # One stylesheet to rule them all
│   └── js/
│       ├── main.js        # Orchestrator
│       ├── cursor.js      # Custom cursor with follower
│       ├── cards.js       # Tilt & parallax on cards
│       ├── stickers.js    # Draggable stickers & post-its
│       ├── text-effects.js# Scramble & split text animations
│       ├── ui.js          # Nav, scroll, reveals
│       ├── gyroscope.js   # Device motion effects
│       ├── settings.js    # Settings panel
│       └── easter-eggs.js # Shh... try triple-clicking the logo
├── portfolio/             # Case studies (coming soon)
├── blog/                  # Blog posts (coming soon)
└── CNAME                  # valderas.be
```

## Fun stuff to poke at

Since you're already snooping around — here's what to look for:

- **Custom cursor** — follows your mouse with a smooth trailing dot
- **Magnetic buttons** — hover near them and they'll come to you
- **Draggable stickers** — grab 'em and move 'em around
- **Scroll reveals** — content fades in as you scroll
- **Dark mode** — triple-click the logo (yes, really)
- **Gyroscope support** — tilt your phone, things move
- **Marquee ticker** — infinite scroll of skills, because why not

## Running locally

It's a static site. Literally open `index.html` in a browser. Or if you're fancy:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# PHP (why not)
php -S localhost:8000
```

## Deployment

Hosted on **GitHub Pages** with a custom domain.

1. Push to `main`
2. That's it. That's the CI/CD pipeline.

## Colophon

Designed and directed by **Inti Valderas Caro**.
Written by **Claude Code** — who does not complain about pixel-pushing at 1am.


## License

The code structure is open for inspiration. The content, design, and personal branding are mine.
If you build something cool inspired by this, I'd love to see it — [reach out](https://valderas.be/#contact)!
