import * as vscode from 'vscode'
import * as fs     from 'fs'
import * as open   from 'open'
import * as utils  from './gearsUtils'

import { ChildProcess, exec } from 'child_process'
import { GearsTaskProvider } from './gearsTaskProvider'
import { Config } from './common'

import {
    LanguageClient,
    LanguageClientOptions,
    RevealOutputChannelOn,
} from 'vscode-languageclient/node';

const outputChannel = vscode.window.createOutputChannel("GEARS")
let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    outputChannel.appendLine('Extension "vscode-gears" is now activating...')

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
    vscode.languages.setLanguageConfiguration('scenario', {
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

    const gearsConfig = utils.loadGearsConfig() // configuration from gears.json
    const serverOptions = () => startLanguageServer(process.env, gearsConfig)

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'sn' }],
        outputChannel,
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

    outputChannel.appendLine('Extension "vscode-gears" is now active')
}

export function deactivate() {
    outputChannel.appendLine('Extension "vscode-gears" is deactivated')
}

function startLanguageServer(env: any, gearsConfig: any): Promise<ChildProcess> {
    return new Promise((resolve, reject) => {
        outputChannel.appendLine('Starting GEARS language server...')

        const child = exec(`gears-server ${gearsConfig.generatorVersion}`, { env });
        /*
        child.stdout.on('data', (data) => {
            outputChannel.appendLine(`stdout: ${data}`);
        });
        child.stderr.on('data', (data) => {
            outputChannel.appendLine(`stderr: ${data}`);
        });
        */
        child.on('error', (err) => {
            outputChannel.appendLine('GEARS language server error')
            reject(err);
        });

        resolve(child);
    });
  }
