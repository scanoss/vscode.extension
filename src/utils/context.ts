import * as vscode from 'vscode';

let context: vscode.ExtensionContext;

export function setContext(ctx: vscode.ExtensionContext) {
    context = ctx;
}

export function getContext(): vscode.ExtensionContext {
    if (!context) {
        throw new Error('Extension context has not been set.');
    }
    return context;
}
