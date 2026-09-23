# Everforest Userstyles

Porting and conversion toolkit to bring the comfortable, warm green [Everforest](https://github.com/sainnhe/everforest) color palette to web services using Stylus.

## Features

- **Automated converter**: Convert any `.user.less` from `catppuccin/userstyles` into an Everforest userstyle with a single CLI command.
- **Drop-in LESS library**: `lib/everforest.less` aliases 26 standard Catppuccin color tokens directly to Everforest hex values across all 6 contrast modes (dark hard, medium, soft; light hard, medium, soft).
- **Zero dependencies**: Converter runs on native Node.js without needing external npm modules.

## Repository Structure

```text
everforest-userstyles/
├── lib/
│   └── everforest.less             # Standalone Everforest palette shim
├── scripts/
│   └── converter.mjs               # Node.js CLI converter
├── styles/
│   └── github/
│       ├── catppuccin.user.less    # Original reference
│       └── everforest.user.less    # Converted ready-to-use userstyle
├── package.json
└── README.md
```

## Quick Start

### 1. Using Pre-converted Styles

Copy the contents of `styles/<service>/everforest.user.less` and paste it directly into a new style in the [Stylus](https://add0n.com/stylus.html) browser extension.

### 2. Converting Any Catppuccin Userstyle

Convert any local file:

```bash
node scripts/converter.mjs path/to/catppuccin.user.less -o output.everforest.user.less
```

Convert directly from a GitHub URL:

```bash
node scripts/converter.mjs https://raw.githubusercontent.com/catppuccin/userstyles/main/styles/youtube/catppuccin.user.less -o styles/youtube/everforest.user.less
```

Optional flags:
- `--inline`: Inlines `lib/everforest.less` into the output file so the style is self-contained (default).
- `--cdn <url>`: Replaces `@import` with an external CDN link to your hosted library.
- `--name <title>`: Overrides the UserStyle title in the header metadata.

## Palette Matrix

| Token | Dark (Medium) | Light (Medium) |
|---|---|---|
| Background (`@base`, `@mantle`) | `#2d353b` | `#fdf6e3` |
| Deep Background (`@crust`) | `#232a2e` | `#efebd4` |
| Foreground (`@text`) | `#d3c6aa` | `#5c6a72` |
| Primary Accent (`@green`) | `#a7c080` | `#8da101` |
| Secondary Accent (`@aqua`) | `#83c092` | `#35a77c` |
| Blue (`@blue`) | `#7fbbb3` | `#3a94c5` |
| Purple (`@purple`, `@mauve`) | `#d699b6` | `#df69ba` |
| Orange (`@orange`, `@peach`) | `#e69875` | `#f57d26` |
| Yellow (`@yellow`) | `#dbbc7f` | `#dfa000` |
| Red (`@red`) | `#e67e80` | `#f85552` |
