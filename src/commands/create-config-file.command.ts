import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { defaultConfig } from '../utils/config';
import { showLog } from '../utils/logs';
import { getRootProjectFolder } from '../utils/sdk';

export const createConfigFile = vscode.commands.registerCommand(
  'extension.createConfigFile',
  async () => {
    processingButton('Creating configuration file');

    try {
      const rootFolder = await getRootProjectFolder();

      fs.writeFileSync(
        path.join(rootFolder, '.scanossrc'),
        JSON.stringify(defaultConfig, null, 2)
      );

      vscode.window.showInformationMessage(
        'The .scanossrc file was created successfully'
      );

      doneButton('File created');
    } catch (error) {
      showLog(`An error ocurred: ${error}`);

      doneButton('SCANOSS', 'error');
      const option = await vscode.window.showErrorMessage(
        'An error occurred while trying to create the .scanossrc file.',
        ...['Retry']
      );

      if (option === 'Retry') {
        vscode.commands.executeCommand('extension.createConfigFile');
      }
    } finally {
      doneButton();
    }
  }
);
