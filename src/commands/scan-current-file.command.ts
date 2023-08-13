import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { showLog } from '../utils/logs';
import { scanFiles } from '../utils/sdk';

export const scanCurrentFileCommand = vscode.commands.registerCommand(
  'extension.scanCurrentFile',
  async () => {
    try {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        throw new Error();
      }

      const fileName = vscode.window.activeTextEditor?.document.fileName
        .split('/')
        .at(-1);

      if (fileName?.includes('extension-output')) {
        vscode.window.showInformationMessage(
          'Please focus on the editor, not the terminal, before running the command.'
        );
        return;
      }

      processingButton(
        `Scanning ${fileName}`,
        `SCANOSS is scanning ${fileName}`
      );

      const filePath = editor.document.uri.fsPath;
      const { foundErrors, scanResults } =
        (await scanFiles([filePath], true)) || {};
      if (!foundErrors) {
        showLog(
          `No match found. SDK response: ${JSON.stringify(
            scanResults,
            null,
            2
          )}`
        );
      } else {
        showLog(JSON.stringify(scanResults, null, 2));
      }

      doneButton();
    } catch (error) {
      showLog(`An error ocurred: ${error}`);

      doneButton('SCANOSS', 'error');
      const option = await vscode.window.showErrorMessage(
        'An error occurred while trying to scan the current file.',
        ...['Retry']
      );

      if (option === 'Retry') {
        vscode.commands.executeCommand('extension.scanCurrentFile');
      }
    } finally {
      doneButton();
    }
  }
);
