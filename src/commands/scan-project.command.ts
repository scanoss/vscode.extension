import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import { processingButton, doneButton } from '../ui/main-button.status-bar';
import { scanDependencies } from '../utils/dependencyScanner';
import { showLog } from '../utils/logs';
import { checkIfSbomExists } from '../utils/sbom';
import { collectFilePaths, getRootProjectFolder } from '../utils/sdk';
import { generateSpdxLite, getPackage } from '../utils/spdx';

export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProject',
  async () => {
    processingButton(
      'Scanning project',
      'ScanOSS is scanning the entire project for matches'
    );

    try {
      const scanner = new Scanner();
      const sbomFile = await checkIfSbomExists();
      const rootFolder = await getRootProjectFolder();
      const filePaths = await collectFilePaths(rootFolder);
      const scanDependenciesResult = await scanDependencies(filePaths);

      let depPackages: string[] = [];
      let depDocumentDescribes: string[] = [];
      scanDependenciesResult.filesList.map((file) => {
        file.dependenciesList.map((dependency) => {
          const depPackage = getPackage(dependency);
          if (depPackage) {
            depPackages.push(depPackage);
            depDocumentDescribes.push(depPackage.SPDXID);
          }
        });
      });

      const resultPath = await scanner.scan([
        sbomFile
          ? {
              fileList: filePaths,
              sbom: sbomFile.path,
            }
          : {
              fileList: filePaths,
            },
      ]);

      if (resultPath) {
        fs.readFile(resultPath, 'utf-8', async (err, data) => {
          if (err) {
            doneButton();
            throw new Error(
              `An error occurred while trying to read the temporary file`
            );
          }

          const dirname = `${rootFolder}/.scanoss`;

          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
          }

          fs.writeFileSync(path.join(dirname, 'sbom.temp.json'), data, 'utf-8');
          doneButton();

          const result = await checkIfSbomExists();

          const optionSelected = await vscode.window.showInformationMessage(
            result
              ? 'Do you want to update your local sbom.json file with the scan results?'
              : 'We have not detected a sbom.json file. Do you want to create it and add the scan results?',
            ...[result ? 'Update' : 'Create and Update']
          );

          if (
            optionSelected === 'Update' ||
            optionSelected === 'Create and Update'
          ) {
            processingButton(
              'Updating sbom.json file',
              'ScanOSS is updating its sbom.json file with the analysis results'
            );

            try {
              const spdxData = await generateSpdxLite(JSON.parse(data));
              spdxData.packages = spdxData.packages.concat(depPackages);
              spdxData.documentDescribes =
                spdxData.documentDescribes.concat(depDocumentDescribes);
              const spdxDataJSON = JSON.stringify(spdxData, undefined, 4);
              fs.writeFileSync(
                path.join(rootFolder, 'sbom.json'),
                spdxDataJSON,
                'utf-8'
              );

              vscode.window.showInformationMessage(
                'Updated sbom.json file successfully.'
              );

              doneButton('File updated');
            } catch (error) {
              showLog(`An error ocurred: ${error}`);

              doneButton('ScanOSS', 'error');
              vscode.window.showErrorMessage(
                'An error occurred while trying to update the sbom.json file'
              );
            } finally {
              doneButton();
            }
          }
        });
      }
    } catch (error) {
      showLog(`An error ocurred: ${error}`);

      doneButton('ScanOSS', 'error');
      const optionSelected = await vscode.window.showErrorMessage(
        'An error occurred while performing the scan.',
        ...['Retry']
      );

      if (optionSelected === 'Retry') {
        vscode.commands.executeCommand('extension.scanProject');
      }
    } finally {
      doneButton();
    }
  }
);
