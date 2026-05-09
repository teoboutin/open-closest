# Open Closest

VS Code / VSCodium extension that walks up the directory tree from the active file and opens the closest matching file.

If the active file's name already matches the argument, the walk skips it and continues to the next ancestor match — so triggering the command from a `README.md` jumps to the parent directory's `README.md`.

## Commands

- `openClosest.open` — takes a filename argument; bind to keys via `args`.
- `openClosest.pick` — quick-pick from `openClosest.filenames`.
- `openClosest.openDescendant` — takes a filename argument; bind to keys via `args`. Walks **down** from the active file's directory (or the workspace folder if no file is open) and opens the closest same-named file in each branch, quick-picking when there's more than one. Honors VS Code's `files.exclude` / `search.exclude`.
- `openClosest.pickDescendant` — quick-pick from `openClosest.filenames`, then walks down like `openDescendant`.

## Settings

- `openClosest.filenames` (string[]): filenames offered by the pick command.
- `openClosest.stopAtWorkspaceRoot` (boolean, default `true`): stop the walk at the workspace folder.

## Example keybindings

Copy into your `keybindings.json` to set up (eg `$HOME/.config/VSCodium/User/keybindings.json`).
Keybind arguments do not seem to be configurable from IDE.

```json
{ "key": "ctrl+k ctrl+u r", "command": "openClosest.open", "args": "README.md" },
{ "key": "ctrl+k ctrl+d r", "command": "openClosest.openDescendant", "args": "README.md" },
{ "key": "ctrl+k ctrl+u c", "command": "openClosest.open", "args": "CMakeLists.txt" },
{ "key": "ctrl+k ctrl+d c", "command": "openClosest.openDescendant", "args": "CMakeLists.txt" },
{ "key": "ctrl+k u", "command": "openClosest.pick" },
{ "key": "ctrl+k d", "command": "openClosest.pickDescendant" }
```
