import * as vscode from 'vscode';

export const showLog = (message: string) => {
  const outputChannel = vscode.window.createOutputChannel('SCANOSS');
  outputChannel.show();
  outputChannel.appendLine(message);
};
