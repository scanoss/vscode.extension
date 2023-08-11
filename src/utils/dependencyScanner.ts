import fs from 'fs';
import { DependencyScanner } from 'scanoss';
import { showLog } from './logs';
import { getRootProjectFolder } from './sdk';

export const scanDependencies = async (allFiles: string[]) => {
  try {
    const rootFolder = await getRootProjectFolder();
    const rootPath = rootFolder + '/';

    const dependencyScanner = new DependencyScanner();
    const dependencies = await dependencyScanner.scan(allFiles);

    dependencies.filesList.forEach((f) => {
      f.file = f.file.replace(rootPath, '');
    });

    const dirname = `${rootFolder}/.scanoss`;

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    await fs.promises.writeFile(
      `${dirname}/dependencies.json`,
      JSON.stringify(dependencies, null, 2)
    );

    return dependencies;
  } catch (error) {
    showLog(`An error ocurred: ${error}`);

    throw new Error(`An error occurred while scanning the files., ${error}`);
  }
};
