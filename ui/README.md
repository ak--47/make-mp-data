# 🎲 Dungeon Master 4 - Web UI

A dark magic-themed web interface for generating Mixpanel data schemas using AI.

## Overview

Dungeon Master 4 provides a simple, elegant web interface that recreates the functionality of the `create-dungeon.mjs` script. Users can describe their desired data schema in natural language, and the AI will generate a complete dungeon configuration.

## Features

- 🌙 **Dark Mode UI** - Red and black magic-themed interface
- 🤖 **AI-Powered Generation** - Powered by Gemini AI
- ✨ **Monaco Editor** - Syntax highlighting and editing for generated JSON
- 📋 **Copy & Download** - Easy export of generated schemas
- 🎯 **Simple & Clean** - No frameworks, just vanilla JavaScript

## Quick Start

### Start the Server

```bash
# Start the UI server
npm run ui

# Or with auto-reload during development
npm run ui:dev
```

The server will start on `http://localhost:3000` by default.

### Usage

1. **Enter a Prompt**: Describe the type of data you want to generate
   - Example: "Create an e-commerce platform with product views, add to cart, checkout, and purchase events"

2. **Generate Schema**: Click "Generate Schema" or press `Ctrl/Cmd + Enter`

3. **Review & Edit**: The AI-generated schema appears in the Monaco Editor
   - Full JSON syntax highlighting
   - Edit directly in the editor
   - Auto-formatting and validation

4. **Export**: Copy to clipboard or download as a JSON file

## File Structure

```
ui/
├── server.js           # Express server
├── public/
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Dark magic theme styles
│   └── app.js          # Client-side application logic
└── README.md           # This file
```

## API Endpoints

### POST /api/generate
Generate a dungeon schema from a natural language prompt.

**Request:**
```json
{
  "prompt": "Create an e-commerce site with purchase events"
}
```

**Response:**
```json
{
  "success": true,
  "schema": { /* Generated schema object */ },
  "timestamp": "2025-10-10T12:00:00.000Z"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "Dungeon Master 4"
}
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `GEMINI_API_KEY` - Required for AI generation (inherited from `.env`)

## Technologies Used

- **Express** - Web server framework
- **Monaco Editor** - VS Code's editor component
- **Vanilla JavaScript** - No frontend frameworks
- **Gemini AI** - Schema generation via `ak-gemini`

## Development

The UI communicates with the existing `generateAISchema` function from `lib/utils/ai.js`, ensuring consistency with the CLI workflow.

### Hot Reload

Use `npm run ui:dev` for automatic server restart on file changes.

## Next Steps

After generating a schema:

1. Review and customize the JSON in the editor
2. Copy or download the configuration
3. Save it as a `.js` file in your project
4. Use it with: `npx make-mp-data your-config.js`

## Troubleshooting

**Server won't start:**
- Ensure Express is installed: `npm install`
- Check that port 3000 is available
- Verify `GEMINI_API_KEY` is set in `.env`

**AI generation fails:**
- Verify your Gemini API key is valid
- Check console logs for detailed error messages
- Ensure you have an active internet connection

---

Built with ❤️ for the Mixpanel community
