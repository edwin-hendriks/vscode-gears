import * as vscode from 'vscode'
import * as fs     from 'fs'
import * as open   from 'open'
import * as utils   from './gearsUtils'

import { GearsTaskProvider } from './gearsTaskProvider'
import { Config } from './common'

import {
    LanguageClient,
    LanguageClientOptions,
    RevealOutputChannelOn,
    ServerOptions
} from 'vscode-languageclient/node';

const outputChannel = vscode.window.createOutputChannel("GEARS")
let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "vscode-gears" is now activating...')

    vscode.languages.setLanguageConfiguration('sn', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        comments: {
            lineComment: '//',
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
        ],
    })

    const workspaceRoot = vscode.workspace.rootPath
    const config: Config = section => vscode.workspace.getConfiguration('gears').get(section)

    context.subscriptions.push(
        vscode.tasks.registerTaskProvider(GearsTaskProvider.GearsType, new GearsTaskProvider(workspaceRoot, config))
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('gears.showDiagrams', () => {
            const index = `${workspaceRoot}/target/diagrams/index.html`
            if (!fs.existsSync(index)) {
                vscode.window.showInformationMessage('Diagrams have not been generated yet')
                return
            }
            open(index)
        })
    )

    const gearsConfig = utils.loadGearsConfig()
    const env = { ...process.env }
    const serverOptions: ServerOptions = {
        run: {
            command: 'java',
            args: ['-cp', utils.getGeneratorJar(gearsConfig), 'com.xlrit.gears.languageserver.GearsLanguageServerLauncher'],
            options: { env }
        },
        debug: {
            command: 'java',
            args: ['-cp', utils.getGeneratorJar(gearsConfig), 'com.xlrit.gears.languageserver.GearsLanguageServerLauncher'],
            options: { env }
        },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'sn' }],
        outputChannel: outputChannel,
        revealOutputChannelOn: RevealOutputChannelOn.Info,
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'gearsLanguageServer',
        'GEARS Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();

    console.log('Extension "vscode-gears" is now active')
}

export function deactivate() {
    console.log('Extension "vscode-gears" is deactivated')
}
