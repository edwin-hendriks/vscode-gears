import * as vscode from 'vscode';

export class GearsTaskProvider implements vscode.TaskProvider {
    static GearsType: string = 'gears';

	constructor(workspaceRoot: string) {
		// TODO use/store workspaceRoot?
    }
    
    provideTasks(token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        console.log('provideTasks');
        function createTask(name: string, command: string): vscode.Task {
            const def = { 
                type: GearsTaskProvider.GearsType, 
                name: name
            }
            const task = new vscode.Task(def, vscode.TaskScope.Workspace, def.name, def.type, new vscode.ShellExecution(command));
            task.group = vscode.TaskGroup.Build
            return task
        }
        return [
            createTask('1 Generate', 'java -jar "${env:GEARS_RELEASES}/gears-generator-assembly-${config:gears.version}.jar" -name ${config:project.name} *.sn'),
            createTask('2 Diagrams', '"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" ${workspaceFolder}/target/diagrams/index.html'),
            createTask('3 Build', 'cd ${workspaceFolder}/target/${config:project.name} && mvn clean package'),
            createTask('4 Deploy', 'docker cp ${workspaceFolder}/target/${config:project.name}/target/${config:project.name}-${config:project.version}.war gears-runtime:/camunda/standalone/deployments'),
        ];
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        const def = task.definition
        console.log('resolveTask: ' + def.name);
        const newTask = new vscode.Task(def, task.scope, def.name, def.type, task.execution);
        newTask.group = task.group;
        return newTask;
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
	name: string;
}
