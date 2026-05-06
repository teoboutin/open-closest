# Open Closest

VS Code / VSCodium extension that walks up the directory tree from the active file and opens the closest matching file.

## Commands

- `openClosest.open` — takes a filename argument; bind to keys via `args`.
- `openClosest.pick` — quick-pick from `openClosest.filenames`.

## Settings

- `openClosest.filenames` (string[]): filenames offered by the pick command.
- `openClosest.stopAtWorkspaceRoot` (boolean, default `true`): stop the walk at the workspace folder.

## Example keybindings

```json
{ "key": "ctrl+k r", "command": "openClosest.open", "args": "README.md" },
{ "key": "ctrl+k c", "command": "openClosest.open", "args": "CMakeLists.txt" },
{ "key": "ctrl+k o", "command": "openClosest.pick" }
```
