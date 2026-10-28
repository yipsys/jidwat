# jidwat   full release november 12th

**A free, work-in-progress desktop tool for exploring game assets, models, and levels.**

jidwat is a B2B reverse engineering project for studios, technical teams, and creators. Its goal is to make supported decompiled game projects easier to understand and work with through a visual interface, rather than handling every task through code or an AI assistant.

The focus is **game transparency**: showing how content is organized, how models and levels fit together, and what can be inspected or adapted. Over time, game-specific adapters will help users bring selected content from one supported project into another.

> **WIP — release update:** This repository currently contains an interface prototype. Release of the full tool has been delayed for reasons that are not being shared at this time. It will be released when I am able to do so, sometime after **19 October 2026**. There is no confirmed release date yet.

## What is available today?

- Project setup with example Super Mario 64 and Ocarina of Time selections
- Content browsing, search, and illustrative scene previews
- Import settings for scale, collision, materials, and spawn coordinates
- Staging controls to add, edit, remove, and restore selections
- Project renaming, local autosave, recent projects, and JSON import/export
- A compact dark interface with collapsible navigation
- A Tauri 2 desktop scaffold with native folder and project-file dialogs

The content lists are sample data and the scene previews are images. Selecting a decomp folder does not inspect its contents. Build steps are simulated. The Windows desktop code has not yet been compiled or tested.

## Where the project is heading

The intended workflow is:

1. Select a base game and a source game from a supported catalogue.
2. Load their local decomp projects through game-specific adapters.
3. Inspect actual assets, models, levels, and collision in an editor.
4. Choose content and configure how it should fit into the base project.
5. Generate an output project, review conversion issues, and build it.

Development priorities are a working 3D viewport, decomp readers, asset inspection, and tested conversion workflows. Support will depend on the game pairing and the content being transferred.

## Try the interface

Open `index.html` in a modern browser. No installation or build step is needed for the UI prototype.

Create a project, select sample content in the workspace, and add it to the staging list. Use **Download project** to save a `.jidwat.json` file and **Open project** to restore it.

Local autosave depends on browser storage. Browser folder picking exposes a folder name rather than its full path; a path can also be entered manually. Native full-path access is implemented in the desktop scaffold.

## Windows desktop development

The desktop shell uses **Tauri 2** with the existing HTML, CSS, and JavaScript interface.

Install Node.js with npm, Rust with the MSVC toolchain, Microsoft C++ Build Tools with the **Desktop development with C++** workload, and Microsoft Edge WebView2. See the [official Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

Run these commands from the repository root:

```sh
npm install
npm run desktop
```

To build a Windows installer:

```sh
npm run build
```

The frontend preparation script copies the UI into `dist`. The NSIS installer is expected under `src-tauri/target/release/bundle/nsis/` after a successful build.

## Project layout

```text
index.html              Application layout
app.js                  Base interface and simulated workflow
controls.js             Game selection and editing controls
projects.js             Local saving and project import/export
desktop.js              Tauri integration
*.css                   Interface styles
scripts/prepare-ui.cjs  Frontend preparation script
src-tauri/              Rust desktop shell and packaging configuration
```

## Free use, assets, and licensing

jidwat is intended to be free to use and support lawful reverse engineering workflows. Users can explore it independently, without requiring guidance from its creator.

Use your own assets or assets whose licences permit your intended use. The project does not include extracted game assets or grant permission to reuse third-party game code, models, or levels. The included artwork illustrates the interface; it is not a free game-asset library.

**A source-code licence has not yet been added.** Free-of-charge availability does not establish unrestricted rights to modify or redistribute the code. Reuse permissions will be set out in a licence file.

## Local project data

Project files store your selections, settings, and folder references. They do not copy the decomp projects. Full folder paths may include a computer username, so review exported files before sharing them.


NOT IN USE NOT UPDATED STARTING 5th

