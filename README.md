# Open Closest

VS Code / VSCodium extension that walks up the directory tree from the active file and opens the closest matching file.

If the active file's name already matches the argument, the walk skips it and continues to the next ancestor match — so triggering the command from a `README.md` jumps to the parent directory's `README.md`.

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
