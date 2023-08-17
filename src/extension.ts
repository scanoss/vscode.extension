import * as vscode from 'vscode';
import { createConfigFile } from './commands/create-config-file.command';
import { scanCurrentFileCommand } from './commands/scan-current-file.command';
import { scanFileOnSaveCommand } from './commands/scan-file-on-save.command';
import { scanProjectCommand } from './commands/scan-project.command';
import { removeAllHighlights } from './ui/highlight.editor';

import { checkRcConfigurationFile, checkSbomFile } from './utils/config';

import type { ScanOSSConfig } from './types';

export const defaultConfig: ScanOSSConfig = {
  scanOnSave: true,
  produceOrUpdateSbom: false,
};

export async function activate(context: vscode.ExtensionContext) {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    return;
  }

  const checkConfigAndScan = async (document: vscode.TextDocument) => {
    const { config } = (await checkRcConfigurationFile()) || defaultConfig;

    if (config.produceOrUpdateSbom) {
      await checkSbomFile();
    }

    if (config.scanOnSave) {
      if (
        vscode.window.activeTextEditor &&
        document === vscode.window.activeTextEditor.document
      ) {
        scanFileOnSaveCommand(document);
      }
    }
  };

  vscode.workspace.onDidChangeTextDocument(() => {
    removeAllHighlights();
  });

  vscode.workspace.onDidSaveTextDocument(async (document) => {
    await checkConfigAndScan(document);
  });

  context.subscriptions.push(
    createConfigFile,
    scanCurrentFileCommand,
    scanProjectCommand
  );
}
