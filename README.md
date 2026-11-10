# Simple Calculator

A clean, responsive single-page calculator built with HTML, CSS and vanilla JavaScript.

## Features
- Handcrafted paper & ink theme: warm paper and ink outlines, subtle CSS-only texture, and system serif typography (no external images or fonts)
- Visible light/dark toggle with localStorage persistence; defaults to the system's prefers-color-scheme when no choice is saved
- Addition, subtraction, multiplication and division
- Decimal input and chained operations (evaluated left to right)
- Percent converts the current number to a fraction by dividing by 100
- Clear, backspace and friendly divide-by-zero handling
- Responsive card layout, hover states, visible keyboard focus and accessible button labels
- Keyboard support: digits, `.`, `+`, `-`, `*`, `/`, `%`, Enter or `=` to solve, Backspace to delete, and Escape / Delete / C to clear

## How to run
Download the files and open `index.html` in any modern web browser. No build tools or installation required.

Keep `index.html`, `style.css` and `script.js` together in the same folder.
## Sound feedback

Subtle piano feedback accompanies calculator clicks and matching keyboard input: digits/decimal (tap), operators/percent (button), equals (notification), clear (toggle off), and new error states (caution). Backspace uses a quiet tap. The original calculator has no sign-change control; the isolated sound controller also recognizes sign/negate actions if one is added later. Theme changes use toggle on for light and toggle off for dark.

The speaker button next to the theme toggle mutes/unmutes all interaction sounds, with a changing ink-line icon and accessible label/title. Sounds default to on; the choice is saved as `calculator-sound` in localStorage (`on` / `off`). Muting plays its off confirmation before disabling further feedback; unmuting plays the on confirmation. Playback uses the library's volume option at 25%. Sound requires a network connection and browser audio permission/user interaction; the calculator remains usable without audio.

Credits: [snd-lib](https://github.com/snd-lib/snd-lib), source code under the MIT license; SND02 piano kit sounds by Ayako Taniguchi / the [snd.dev](https://snd.dev/) team (audio rights remain with the credited designer; see snd.dev terms). Loaded via jsDelivr using the documented, pinned `v1.2.4` browser build with `?kit=02`.
