import * as vscode from 'vscode';

type Execution = vscode.ProcessExecution | vscode.ShellExecution | vscode.CustomExecution

export class GearsTaskProvider implements vscode.TaskProvider {
    static GearsType: string = 'gears';

    workspaceRoot: string
    config: vscode.WorkspaceConfiguration

	constructor(workspaceRoot: string, config: vscode.WorkspaceConfiguration) {
        this.workspaceRoot = workspaceRoot
        this.config = config
    }
    
    provideTasks(token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        function createTask(name: string, execution: Execution): vscode.Task {
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
                execution,
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
            createTask('1. Generate',      this.getGenerateExecution()),
            createTask('2. Diagrams',      this.getDiagramsExecution()),
            createTask('3. Build',         this.getBuildExecution()),
            createTask('4. Deploy',        this.getDeployExecution()),
            createTask('5. Run scenarios', this.getRunExecution()),
        ];
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        const def = task.definition
        const newTask = new vscode.Task(def, task.scope, def.name, def.type, task.execution);
        newTask.group = task.group;
        return newTask;
    }

    getGenerateExecution(): Execution {
        const cwd = this.workspaceRoot
        const cmd = 'java -jar "${env:GEARS_RELEASES}/gears-generator-assembly-${config:gears.generator.version}.jar" -name ${config:gears.project.name} *.sn'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getDiagramsExecution(): Execution {
        const cwd     = this.workspaceRoot
        const browser = this.config.get('browser')
        const page    = `${this.workspaceRoot}/target/diagrams/index.html`
        const cmd     = `${browser} ${page}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getBuildExecution(): Execution {
        const projectName = this.config.get('project.name')
        const cwd = `${this.workspaceRoot}/target/${projectName}`
        const cmd = 'mvn clean package'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getDeployExecution(): Execution {
        const projectName    = this.config.get('project.name')
        const projectVersion = this.config.get('project.version')
        const cwd  = `${this.workspaceRoot}/target/${projectName}/target`
        const cmd  = this.getDeployCmd(`${projectName}-${projectVersion}.war`)
        return new vscode.ShellExecution(cmd,  { cwd })
    }

    getDeployCmd(file: string): string {
        switch (this.config.get("deploy.mode")) {
            case 'gears-cli': 
                return `docker cp ${file} gears-runtime:/camunda/standalone/deployments`;
            default:
                return `gears runtime deploy ${file}`;
        }
    }

    getRunExecution(): Execution {
        const cwd = this.workspaceRoot
        const cmd = 'java -jar "${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar" scenarios/*.scenario'
        return new vscode.ShellExecution(cmd, { cwd })
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
	name: string;
}
