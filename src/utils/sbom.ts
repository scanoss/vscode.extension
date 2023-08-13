import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { showLog } from './logs';
import { getRootProjectFolder } from './sdk';

export const checkIfSbomExists = async (): Promise<vscode.Uri | undefined> => {
  const sbomFile = await vscode.workspace.findFiles('sbom.json');

  if (sbomFile.length > 0) {
    return Promise.resolve(sbomFile[0]);
  } else {
    return Promise.resolve(undefined);
  }
};

export const createSbomFile = async () => {
  try {
    const rootFolder = await getRootProjectFolder();
    const blankSbomFile = generateSbomTemplate();

    fs.writeFileSync(
      path.join(rootFolder, 'sbom.json'),
      JSON.stringify(blankSbomFile, null, 2)
    );

    vscode.window.showInformationMessage(
      'The sbom.json file was created successfully'
    );
  } catch (error) {
    showLog(`An error ocurred: ${error}`);

    vscode.window.showErrorMessage(
      `An error occurred while trying to create the sbom.json file.`
    );
  }
};

export const importSbomFile = async (file: vscode.Uri) => {
  try {
    const rootFolder = await getRootProjectFolder();

    fs.copyFileSync(file.fsPath, path.join(rootFolder, 'sbom.json'));

    vscode.window.showInformationMessage(
      'The sbom.json file was successfully imported into your project.'
    );
  } catch (error) {
    showLog(`An error ocurred: ${error}`);

    vscode.window.showErrorMessage(
      `An error occurred while trying to import the sbom.json file.`
    );
  }
};

export const generateSbomTemplate = () => {
  const spdx = {
    spdxVersion: 'SPDX-2.2',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-###',
    name: 'SCANOSS-SBOM',
    documentNamespace: 'https://spdx.org/spdxdocs/UUID',
    creationInfo: {
      creators: [
        'Tool: SCANOSS Vscode Extension',
        `Person: ${os.userInfo().username}`,
      ],
      created: new Date().toISOString(),
    },
    packages: [] as any,
    documentDescribes: [] as any,
  };

  return spdx;
};
