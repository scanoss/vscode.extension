import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import { highlightLines } from '../ui/highlight.editor';
import { showErrorLog } from './logs';
import { checkIfSbomExists } from './sbom';

export const getRootProjectFolder = async () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    return workspaceFolders[0].uri.fsPath as string;
  }

  throw new Error(`No open workspace found.`);
};

export const scanFiles = async (
  filePathsArray: string[],
  highlightErrors = false
) => {
  try {
    const scanner = new Scanner();
    const sbomFile = await checkIfSbomExists();
    const rootFolder = await getRootProjectFolder();

    const resultPath = await scanner.scan([
      sbomFile
        ? {
            fileList: filePathsArray,
            sbom: sbomFile.path,
          }
        : {
            fileList: filePathsArray,
          },
    ]);

    if (resultPath) {
      try {
        const document = await vscode.workspace.openTextDocument(resultPath);
        const data = document.getText();

        const dirname = `${rootFolder}/.scanoss`;

        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }

        fs.writeFileSync(path.join(dirname, 'scanoss-raw.json'), data, 'utf-8');

        type ScanResult = {
          [scannedFilePath: string]: any[];
        };

        const scanResults = JSON.parse(data);

        if (highlightErrors) {
          let foundErrors = false;
          for (const [scannedFilePath, findings] of Object.entries(
            scanResults as ScanResult
          )) {
            for (const finding of findings) {
              if (finding.id !== 'none') {
                foundErrors = true;
                await highlightLines(scannedFilePath, finding.lines);
              }
            }
          }
          return { foundErrors, scanResults };
        } else {
          return { foundErrors: false, scanResults };
        }
      } catch (error: any) {
        showErrorLog(`An error ocurred: ${error}`);

        console.error(`Error reading scan result: ${error.message}`);
      }
    }
  } catch (error) {
    showErrorLog(`An error ocurred: ${error}`);

    throw new Error(`An error occurred while scanning the files.`);
  }
};

export const collectFilePaths = async (
  directoryPath: string,
  filePaths: string[] = []
) => {
  try {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        await collectFilePaths(entryPath, filePaths);
      } else if (entry.isFile()) {
        filePaths.push(entryPath);
      }
    }

    return filePaths;
  } catch (error) {
    showErrorLog(`An error ocurred: ${error}`);

    throw new Error(`An error occurred while collecting the file paths`);
  }
};
