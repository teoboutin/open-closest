import * as vscode from 'vscode';
import * as path from 'path';
import { findClosest } from './findClosest';
import { pruneToFirstDescendants } from './firstDescendants';

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

  const excludePath = editor ? path.resolve(editor.document.uri.fsPath) : undefined;
  const wasOnMatch = excludePath !== undefined && path.basename(excludePath) === filename;

  const found = findClosest(startDir, filename, stopAt, excludePath);
  if (!found) {
    const where = stopAt ? `between ${startDir} and workspace root` : `walking up from ${startDir}`;
    const msg = wasOnMatch
      ? `Open Closest: no other ${filename} found above ${startDir}.`
      : `Open Closest: no ${filename} found ${where}.`;
    vscode.window.showInformationMessage(msg);
    return;
  }

  const doc = await vscode.workspace.openTextDocument(found);
  await vscode.window.showTextDocument(doc);
}

async function openDescendant(filename: string): Promise<void> {
  if (!filename) {
    vscode.window.showErrorMessage(
      'openClosest.openDescendant requires a filename argument (e.g. "README.md").',
    );
    return;
  }

  const editor = vscode.window.activeTextEditor;
  const folders = vscode.workspace.workspaceFolders;
  const anchorUri = editor?.document.uri ?? folders?.[0]?.uri;
  if (!anchorUri) {
    vscode.window.showInformationMessage('Open Closest: no active file or workspace folder.');
    return;
  }
  const anchorDir = editor ? path.dirname(anchorUri.fsPath) : anchorUri.fsPath;
  const activePath = editor?.document.uri.fsPath;

  let uris: vscode.Uri[];
  try {
    const pattern = new vscode.RelativePattern(anchorDir, '**/' + filename);
    uris = await vscode.workspace.findFiles(pattern);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Open Closest: descendant search failed: ${msg}`);
    return;
  }

  const rels: string[] = [];
  for (const uri of uris) {
    if (uri.fsPath === activePath) continue;
    const rel = path.relative(anchorDir, uri.fsPath).split(path.sep).join('/');
    rels.push(rel);
  }

  const kept = pruneToFirstDescendants(rels);

  if (kept.length === 0) {
    vscode.window.showInformationMessage(
      `Open Closest: no descendant ${filename} found below ${anchorDir}.`,
    );
    return;
  }

  const toFsPath = (rel: string): string => path.join(anchorDir, ...rel.split('/'));

  const open = async (fsPath: string, relForError: string): Promise<void> => {
    try {
      const doc = await vscode.workspace.openTextDocument(fsPath);
      await vscode.window.showTextDocument(doc);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Open Closest: failed to open ${relForError}: ${msg}`);
    }
  };

  if (kept.length === 1) {
    await open(toFsPath(kept[0]), kept[0]);
    return;
  }

  type Item = vscode.QuickPickItem & { rel: string };
  const items: Item[] = kept.map((rel) => ({
    label: rel,
    description: String(rel.split('/').length),
    rel,
  }));

  const choice = await vscode.window.showQuickPick(items, {
    placeHolder: `Open descendant ${filename}…`,
  });
  if (!choice) return;
  await open(toFsPath(choice.rel), choice.rel);
}

async function pickDescendant(): Promise<void> {
  const filenames = vscode.workspace.getConfiguration('openClosest').get<string[]>('filenames', []);
  if (filenames.length === 0) {
    vscode.window.showInformationMessage('Configure "openClosest.filenames" first.');
    return;
  }
  const picked = await vscode.window.showQuickPick(filenames, {
    placeHolder: 'Open closest descendant…',
  });
  if (picked) await openDescendant(picked);
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
    vscode.commands.registerCommand('openClosest.openDescendant', (filename?: string) => openDescendant(filename ?? '')),
    vscode.commands.registerCommand('openClosest.pickDescendant', () => pickDescendant()),
  );
}

export function deactivate(): void {}
