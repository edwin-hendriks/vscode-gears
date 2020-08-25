import * as vscode from 'vscode'
import * as fs from 'fs'
import * as open from 'open'

import { GearsTaskProvider } from './gearsTaskProvider'
import { Config } from './common'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
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
        vscode.commands.registerCommand('gears.showDiagrams.outside', () => {
            const index = `${workspaceRoot}/target/diagrams/index.html`
            if (!fs.existsSync(index)) {
                vscode.window.showInformationMessage('Diagrams have not been generated yet')
                return
            }
            open(index)
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('gears.showDiagrams.inside', () => {
            const index = `${workspaceRoot}/target/diagrams/index.html`
            if (!fs.existsSync(index)) {
                vscode.window.showInformationMessage('Diagrams have not been generated yet')
                return
            }

            const panel = vscode.window.createWebviewPanel(
                'gears',
                'Diagrams',
                vscode.ViewColumn.Two,
                {
                  enableScripts: true, // Enable scripts in the webview
                }
              )
        
            panel.webview.html = "<html>Hello</html>"
        })
    )

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Extension "vscode-gears" is now active with ' + JSON.stringify(config))
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension "vscode-gears" is deactivated')
}
