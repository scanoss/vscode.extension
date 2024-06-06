import * as vscode from 'vscode';

// Create the output channel once when this module is loaded
const outputChannel = vscode.window.createOutputChannel('SCANOSS');

export const showLog = (message: string) => {
  outputChannel.show();
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  outputChannel.appendLine(
    `---- ${new Date().toLocaleDateString()} ${currentTime} | SCANOSS ----`
  );

  outputChannel.appendLine(message);
};

export const showErrorLog = (message: string) => {
  outputChannel.show();
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  outputChannel.appendLine(
    `---- ${new Date().toLocaleDateString()} ${currentTime} | SCANOSS ERROR ----`
  );

  outputChannel.appendLine(message);
};
