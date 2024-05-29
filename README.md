# SCANOSS VSCode Plugin

## Intro

The SCANOSS plugin for Visual Studio Code (VSCode) is an indispensable tool designed to enhance open source management within the widely-used code editor. By leveraging the OSSKB.org API endpoint provided by the Software Transparency Foundation, this plugin offers developers real-time visibility into software's composition, accurately identifying both declared and undeclared dependencies, components, files, and even code snippets.

With the increasing adoption of AI-generated code and the risk of plagiarism, it is crucial to validate the origin and compliance of such code. The SCANOSS plugin utilizes the extensive SCANOSS knowledgebase to assess potential security vulnerabilities, licensing issues, and compliance risks directly within the VSCode environment. This empowers developers to effectively manage open source components, ensuring the security, reliability, and compliance of their software throughout the development process.

### Usage

You can use the following commands from the VScode command palette:

| Command                    | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| SCANOSS: Scan Project      | Performs a complete scan of the project files and proposes options. |
| SCANOSS: Scan Current File | Scans the currently open file.                                      |
| SCANOSS: Set API Key       | Set SCANOSS API Key token.                                          |

The `.scanoss` directory will serve as the storage location for all files associated with the scanning process.

### Configuration

You can create a configuration file `.scanossrc` with the following options:

| Option              | Default | Description                                                                                                  |
| ------------------- | ------- | -------------------------------------------------------------------------------------------------------      |
| scanOnSave          | true    | Every time you manually or automatically save a change to a file, a scan of the file will be performed.      |
| produceOrUpdateSbom | false   | Following each scan, a prompt is activated, requesting the creation or updating of an SBOM file 'sbom.json'. |


### API Configuration
You can configure the API connection parameters to use dedicated servers.

To do this, set the following:

- API URL: Setting the URL from Extensions Preferences (File -> Preferences -> Settings -> Extensions -> SCANOSS).
- API KEY: Run the `SCANOSS: Store API Key` command from the Command Palette (View -> Command Palette)