import * as vscode from 'vscode';
import { getContext } from '../utils/context';

export const storeApiKeyCommand = vscode.commands.registerCommand(
    'extension.storeApiKey',
    async () => {
        const context = getContext();

        const apiKey = await vscode.window.showInputBox({ prompt: 'Enter your SCANOSS API Key' });
        if (apiKey != undefined) {
            try {
                await context.secrets.store('API_KEY', apiKey);
                vscode.window.showInformationMessage('SCANOSS: API Key stored successfully!');
            } catch (error: any) {
                vscode.window.showErrorMessage('SCANOSS: Error storing API Key: ' + error.message);
            }
        }
});