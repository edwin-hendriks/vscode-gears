import * as vscode from 'vscode'
import * as fs from 'fs'
import * as open from 'open'

import { GearsTaskProvider } from './gearsTaskProvider'
import { Config } from './common'

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

    context.subscriptions.push(
        vscode.commands.registerCommand('gears.startRuntime', () => {
            const version = config("gears.runtime.version")
            if (!version) {
                vscode.window.showErrorMessage('The GEARS Runtime version is not configured')
                return
            }
            const image = "xlrit/gears-runtime" + version
            vscode.window.showInformationMessage(`Running ${image} is not supported yet`)
            // zie https://github.com/microsoft/vscode-docker/blob/master/src/utils/executeAsTask.ts
            // of iets als executeCommand vscode-docker.containers.start
            // en dan verschillende opties:
            // - gears runtime run --image ${image}
            // - docker run -d --rm -p 1110:110 -p 2525:25 -p 8080:8080 -p 9990:9990 --name gears-runtime ${image}
            // - docker-compose up
        })
    )

    console.log('Extension "vscode-gears" is now active')
}

export function deactivate() {
    console.log('Extension "vscode-gears" is deactivated')
}
