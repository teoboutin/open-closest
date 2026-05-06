import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

function findClosest(startDir: string, filename: string, stopAt: string | undefined): string | undefined {
  let dir = path.resolve(startDir);
  const fsRoot = path.parse(dir).root;
  const stopAtNorm = stopAt ? path.resolve(stopAt) : undefined;

  while (true) {
    const candidate = path.join(dir, filename);
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch { /* not present, keep walking */ }

    if (stopAtNorm && dir === stopAtNorm) return undefined;
    if (dir === fsRoot) return undefined;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

async function openClosest(filename: string): Promise<void> {
  if (!filename) {
    vscode.window.showErrorMessage('openClosest.open requires a filename argument (e.g. "README.md").');
    return;
  }

  const editor = vscode.window.activeTextEditor;
  const folders = vscode.workspace.workspaceFolders;
  const anchorUri = editor?.document.uri ?? folders?.[0]?.uri;
  if (!anchorUri) {
    vscode.window.showInformationMessage('Open Closest: no active file or workspace folder.');
    return;
  }

  const startDir = editor ? path.dirname(anchorUri.fsPath) : anchorUri.fsPath;

  const config = vscode.workspace.getConfiguration('openClosest');
  const stopAtWorkspaceRoot = config.get<boolean>('stopAtWorkspaceRoot', true);
  const stopAt = stopAtWorkspaceRoot
    ? vscode.workspace.getWorkspaceFolder(vscode.Uri.file(startDir))?.uri.fsPath
    : undefined;

  const found = findClosest(startDir, filename, stopAt);
  if (!found) {
    const where = stopAt ? `between ${startDir} and workspace root` : `walking up from ${startDir}`;
    vscode.window.showInformationMessage(`Open Closest: no ${filename} found ${where}.`);
    return;
  }

  const doc = await vscode.workspace.openTextDocument(found);
  await vscode.window.showTextDocument(doc);
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('openClosest.open', (filename?: string) => openClosest(filename ?? '')),
    vscode.commands.registerCommand('openClosest.pick', async () => {
      const filenames = vscode.workspace.getConfiguration('openClosest').get<string[]>('filenames', []);
      if (filenames.length === 0) {
        vscode.window.showInformationMessage('Configure "openClosest.filenames" first.');
        return;
      }
      const pick = await vscode.window.showQuickPick(filenames, { placeHolder: 'Open closest…' });
      if (pick) await openClosest(pick);
    }),
  );
}

export function deactivate(): void {}
