import * as path from 'path';
import * as vscode from 'vscode';
import { showLog } from '../utils/logs';

const activeDecorations = new Map<string, vscode.TextEditorDecorationType>();

export const highlightLines = async (filePath: string, lines: string) => {
  removeAllHighlights();
  try {
    const normalizedFilePath = path.normalize(filePath);
    const editor = vscode.window.visibleTextEditors.find(
      (editor) =>
        path.normalize(editor.document.uri.fsPath) === normalizedFilePath
    );

    if (!editor) {
      throw new Error();
    }

    let ranges: vscode.Range[];

    if (lines === 'all') {
      // Highlight all lines
      const lastLine = editor.document.lineCount - 1;
      ranges = [
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(
            lastLine,
            editor.document.lineAt(lastLine).text.length
          )
        ),
      ];
    } else {
      const lineRanges = lines.split(',');

      ranges = lineRanges.map((range) => {
        const [startLine, endLine] = range
          .split('-')
          .map((line) => parseInt(line) - 1);

        return new vscode.Range(
          new vscode.Position(startLine, 0),
          new vscode.Position(
            endLine,
            editor.document.lineAt(endLine).text.length
          )
        );
      });
    }

    if (activeDecorations.has(filePath)) {
      const currentDecoration = activeDecorations.get(filePath);
      if (currentDecoration) {
        editor.setDecorations(currentDecoration, []);
        currentDecoration.dispose();
      }
    }

    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 255, 160, 0.1)',
      isWholeLine: true,
    });

    editor.setDecorations(decorationType, ranges);

    activeDecorations.set(filePath, decorationType);
  } catch (error: any) {
    showLog(`An error occurred: ${error}`);

    throw new Error(
      `An error occurred when trying to highlight lines. ${error}`
    );
  }
};

export const removeAllHighlights = () => {
  activeDecorations.forEach((decoration) => {
    decoration.dispose();
  });
  activeDecorations.clear();
};
