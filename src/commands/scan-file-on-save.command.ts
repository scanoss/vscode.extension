import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { showLog } from '../utils/logs';
import { scanFiles } from '../utils/sdk';

export const scanFileOnSaveCommand = async (document: vscode.TextDocument) => {
  try {
    processingButton(`Scanning ${document.uri.fsPath.split('/').at(-1)}`);
    const { foundErrors, scanResults } =
      (await scanFiles([document.uri.fsPath], true)) || {};
    if (!foundErrors) {
      showLog(
        `No match found. SDK response: ${JSON.stringify(scanResults, null, 2)}`
      );
    } else {
      showLog(JSON.stringify(scanResults, null, 2));
    }

    doneButton('SCANOSS', 'error');
  } catch (error) {
    showLog(`An error ocurred: ${error}`);

    doneButton('SCANOSS', 'error');
    const option = await vscode.window.showErrorMessage(
      'An error occurred while trying to scan the current file.',
      ...['Retry']
    );
    if (option === 'Retry') {
      scanFileOnSaveCommand(document);
    }
  } finally {
    doneButton();
  }
};
