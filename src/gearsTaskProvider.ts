import * as vscode from 'vscode'
import { Config } from './common'

type Execution = vscode.ProcessExecution | vscode.ShellExecution | vscode.CustomExecution

export class GearsTaskProvider implements vscode.TaskProvider {
    static GearsType: string = 'GEARS'

    workspaceRoot: string
    config: Config

	constructor(workspaceRoot: string, config: Config) {
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
        return [
            createTask('1. Generate',          this.generateExecution()),
            createTask('2. Show Diagrams',     this.diagramsExecution()),
            createTask('3. Build',             this.buildExecution()),
            createTask('4. Run Application',   this.runExecution()),
            createTask('5. Load data',         this.loadDataExecution()),
            createTask('6. Run scenarios',     this.runScenariosExecution()),
            //createTask('7. Stop Application',  this.stopExecution()),
        ];
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        const def = task.definition
        const newTask = new vscode.Task(def, task.scope, def.name, def.type, task.execution);
        newTask.group = task.group;
        return newTask;
    }

    generateExecution(): Execution {
        const projectName    = this.config('project.name')
        const projectVersion = this.config('project.version')
        const runtimeVersion = this.config('runtime.version')
        const filePattern    = this.config('file-pattern.specs')
        const extraArgs      = this.config('generator.extraArgs')
        
        const cwd = this.workspaceRoot
        const generatorJar = '${env:GEARS_RELEASES}/gears-generator-assembly-${config:gears.generator.version}.jar'
        
        var cmd = `java -jar "${generatorJar}"`
        if (projectName)    cmd += ` --name ${projectName}`
        if (projectVersion) cmd += ` --version ${projectVersion}`
        if (runtimeVersion) cmd += ` --runtime-version ${runtimeVersion}`
        if (extraArgs)      cmd += ` ${extraArgs}`
        cmd += ` ${filePattern}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    diagramsExecution(): Execution {
        const cwd     = this.workspaceRoot
        const browser = this.config('browser')
        const page    = `${this.workspaceRoot}/target/diagrams/index.html`
        const cmd     = `${browser} ${page}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    buildExecution(): Execution {
        const projectName = this.config('project.name')
        const cwd = `${this.workspaceRoot}/target/${projectName}`
        const cmd = 'mvn clean package'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    runExecution(): Execution {
        const projectName = this.config('project.name')
        const cwd = `${this.workspaceRoot}/target/${projectName}`
        const cmd = 'mvn spring-boot:run'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    stopExecution(): Execution {
        const projectName = this.config('project.name')
        const cwd = `${this.workspaceRoot}/target/${projectName}`
        const cmd = 'mvn spring-boot:stop -Dspring-boot.stop.fork=true'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    loadDataExecution(): Execution {
        const endpoint    = this.config('runner.endpoint')
        const extraArgs   = this.config('runner.extraArgs')
        const filePattern = this.config('file-pattern.data')

        const cwd = this.workspaceRoot
        const jar = '${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar'
        var cmd = `java -jar "${jar}"`
        if (endpoint) cmd += ` --endpoint ${endpoint}`
        if (extraArgs) cmd += ` ${extraArgs}`
        cmd += ` ${filePattern}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    runScenariosExecution(): Execution {
        const endpoint    = this.config('runner.endpoint')
        const extraArgs   = this.config('runner.extraArgs')
        const filePattern = this.config('file-pattern.scenarios')
        
        const cwd = this.workspaceRoot
        const jar = '${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar'
        var cmd = `java -jar "${jar}"`
        if (endpoint) cmd += ` --endpoint ${endpoint}`
        if (extraArgs) cmd += ` ${extraArgs}`
        cmd += ` ${filePattern}`
        return new vscode.ShellExecution(cmd, { cwd })
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
	name: string;
}
