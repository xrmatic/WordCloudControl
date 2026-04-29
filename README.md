# WordCloudControl

A **Dynamics 365 / Power Apps PCF (PowerApps Component Framework)** custom control that renders a delimited list of words or phrases as an interactive **Word Cloud**.

![Word Cloud Control example](docs/wordcloud-example.png)

---

## Features

| Feature | Details |
|---------|---------|
| **Word Cloud rendering** | Words sized by frequency; powered by [d3-cloud](https://github.com/jasondavies/d3-cloud) |
| **Color Palettes** | Rainbow, Blues, Reds, Greens, Purples, Warm, Cool |
| **Font Families** | Impact, Arial, Georgia, Trebuchet MS, Verdana, Courier New |
| **Font Size Range** | Configurable minimum & maximum font size (px) |
| **Responsive** | Automatically re-renders when the container is resized |
| **Accessibility** | SVG includes `aria-label`; individual words have `<title>` tooltips showing frequency |

---

## Properties

| Property | Type | Usage | Default | Description |
|----------|------|-------|---------|-------------|
| `delimitedList` | `SingleLine.Text` | **Bound** (required) | — | The delimited list of words/phrases to display |
| `delimiter` | `SingleLine.Text` | Input | `,` | Character used to split the list |
| `colorPalette` | Enum | Input | `Rainbow` | Color palette: `Rainbow`, `Blues`, `Reds`, `Greens`, `Purples`, `Warm`, `Cool` |
| `fontFamily` | Enum | Input | `Impact` | Font: `Impact`, `Arial`, `Georgia`, `TrebuchetMS`, `Verdana`, `CourierNew` |
| `minFontSize` | `Whole.None` | Input | `12` | Minimum font size in pixels (least-frequent words) |
| `maxFontSize` | `Whole.None` | Input | `72` | Maximum font size in pixels (most-frequent words) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later  
- [Microsoft Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) (`pac`) — needed to package and deploy

### Install dependencies

```bash
npm install
```

### Build the control

```bash
npm run build
```

### Test locally (development harness)

```bash
npm start
```

This launches a local test harness at `http://localhost:8181` where you can interact with the control and supply sample data.

### Package for deployment

```bash
pac solution init --publisher-name YourPublisher --publisher-prefix xyz --output-directory solution
pac solution add-reference --path .
msbuild /t:build /restore
```

---

## Project Structure

```
WordCloudControl/               # PCF control source
├── ControlManifest.Input.xml   # Control manifest (properties, resources)
├── index.ts                    # Control implementation (TypeScript)
├── d3-cloud.d.ts               # Ambient type declarations for d3-cloud
├── css/
│   └── WordCloudControl.css    # Control styles
├── generated/
│   └── ManifestTypes.d.ts      # Generated TypeScript interfaces (IInputs/IOutputs)
└── strings/
    └── WordCloudControl.1033.resx  # English localization strings
package.json                    # npm dependencies & build scripts
tsconfig.json                   # TypeScript configuration
pcfconfig.json                  # PCF project metadata
```

---

## How It Works

1. The `delimitedList` property is split on the configured `delimiter`.
2. Word frequencies are counted (case-insensitive). More-frequent words appear larger.
3. Font sizes are linearly scaled between `minFontSize` and `maxFontSize`.
4. [d3-cloud](https://github.com/jasondavies/d3-cloud) computes a non-overlapping layout.
5. The words are rendered as an inline SVG using [D3.js](https://d3js.org/).
6. Colors are assigned round-robin from the selected palette.

---

## License

MIT
