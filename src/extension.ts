import * as vscode from 'vscode';
import * as path from 'path';
import { findClosest } from './findClosest';

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
