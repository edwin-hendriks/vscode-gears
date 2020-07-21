import * as vscode from 'vscode';

export class GearsTaskProvider implements vscode.TaskProvider {
    static GearsType: string = 'gears';

    workspaceRoot: string

	constructor(workspaceRoot: string) {
		this.workspaceRoot = workspaceRoot
    }
    
    provideTasks(token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        console.log('provideTasks');
        function createTask(name: string, cwd: string, command: string): vscode.Task {
            const problemMatcher = "$sn"
            const def: GearsTaskDefinition = {
                type: GearsTaskProvider.GearsType, 
                name: name
            }
            const task = new vscode.Task(
                def, 
                vscode.TaskScope.Workspace, 
                def.name, 
                def.type, 
                new vscode.ShellExecution(command, { cwd }),
                problemMatcher
            );
            task.group = vscode.TaskGroup.Build
            task.presentationOptions = { 
                showReuseMessage: false 
            }
            return task
        }
        // TODO task to make sure Runtime (with correct version) is running?
        return [
            createTask('1. Generate',      this.workspaceRoot, 'java -jar "${env:GEARS_RELEASES}/gears-generator-assembly-${config:gears.generator.version}.jar" -name ${config:project.name} *.sn'),
            createTask('2. Diagrams',      this.workspaceRoot, '"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" ${workspaceFolder}/target/diagrams/index.html'),
            createTask('3. Build',         this.workspaceRoot, 'cd ${workspaceFolder}/target/${config:project.name} && mvn clean package'),
            createTask('4. Deploy',        this.workspaceRoot, 'docker cp ${workspaceFolder}/target/${config:project.name}/target/${config:project.name}-${config:project.version}.war gears-runtime:/camunda/standalone/deployments'),
            createTask('5. Run scenarios', this.workspaceRoot, 'java -jar "${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar" scenarios/*.scenario'),
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
