import * as vscode from 'vscode'
import { Config } from './common'

type Execution = vscode.ProcessExecution | vscode.ShellExecution | vscode.CustomExecution

export class GearsTaskProvider implements vscode.TaskProvider {
    static GearsType: string = 'GEARS';

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
            createTask('0. Start Runtime', this.startRuntimeExecution()),
            createTask('1. Generate',      this.generateExecution()),
            createTask('2. Diagrams',      this.diagramsExecution()),
            createTask('3. Build',         this.buildExecution()),
            createTask('4. Deploy',        this.deployExecution()),
            createTask('5. Load data',     this.loadDataExecution()),
            createTask('6. Run scenarios', this.runScenariosExecution()),
            createTask('7. Undeploy',      this.undeployExecution()),
            createTask('8. Stop Runtime',  this.stopRuntimeExecution()),
        ];
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        const def = task.definition
        const newTask = new vscode.Task(def, task.scope, def.name, def.type, task.execution);
        newTask.group = task.group;
        return newTask;
    }

    startRuntimeExecution(): Execution {
        const cwd = this.workspaceRoot
        const cmd = this.startRuntimeCmd()
        return new vscode.ShellExecution(cmd, { cwd })
    }

    startRuntimeCmd(): string {
        const runtimeVersion = this.config('runtime.version')
        switch (this.config('runtime.management.mode')) {
            case 'gears-cli': 
                return `gears runtime run --version ${runtimeVersion}`
            case 'docker-compose':
                return 'docker-compose up'
            default: // docker
                const docker = this.config('docker')
                return `${docker} run -d --rm -p 1110:110 -p 2525:25 -p 8080:8080 -p 9990:9990 --name gears-runtime xlrit/gears-runtime:v${runtimeVersion}`
        }
    }

    stopRuntimeExecution(): Execution {
        const cwd = this.workspaceRoot
        const cmd = this.stopRuntimeCmd()
        return new vscode.ShellExecution(cmd, { cwd })
    }

    stopRuntimeCmd(): string {
        switch (this.config("runtime.management.mode")) {
            case 'gears-cli': 
                return `gears runtime kill`
            case 'docker-compose':
                return 'docker-compose down'
            default: // docker
                const docker = this.config('docker')
                return `${docker} kill gears-runtime`
        }
    }

    generateExecution(): Execution {
        const projectName    = this.config('project.name')
        const projectVersion = this.config('project.version')
        const runtimeVersion = this.config('runtime.version')
        const filePattern    = this.config('file-pattern.specs')
        const generatorJar   = this.getGeneratorJar()
        const cwd = this.workspaceRoot
        var cmd = `java -jar "${generatorJar}"`
        if (projectName)    cmd += ` --name ${projectName}`
        if (projectVersion) cmd += ` --version ${projectVersion}`
        if (runtimeVersion) cmd += ` --runtime-version ${runtimeVersion}`
        cmd += ` ${filePattern}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getGeneratorJar(): String {
        const generatorVersion = this.config('generator.version')
        return "${env:GEARS_RELEASES}/gears-generator-assembly-" + generatorVersion + ".jar"
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

    deployExecution(): Execution {
        const projectName    = this.config('project.name')
        const projectVersion = this.config('project.version')
        const cwd  = `${this.workspaceRoot}/target/${projectName}`
        const cmd  = this.getDeployCmd('target', `${projectName}-${projectVersion}.war`)
        return new vscode.ShellExecution(cmd,  { cwd })
    }

    getDeployCmd(dir: string, file: string): string {
        const path = `${dir}/${file}`
        switch (this.config("deploy.mode")) {
            case 'gears-cli': 
                return `gears runtime deploy ${path}`
            case 'maven':
                return 'mvn org.wildfly.plugins:wildfly-maven-plugin:2.0.2.Final:deploy'
            default:
                const docker = this.config('docker')
                return `${docker} cp ${path} gears-runtime:/camunda/standalone/deployments && ` +
                       `${docker} exec -it gears-runtime wait-for-deployment ${file}`
        }
    }

    undeployExecution(): Execution {
        const projectName    = this.config('project.name')
        const projectVersion = this.config('project.version')
        const cwd  = `${this.workspaceRoot}/target/${projectName}`
        const cmd  = this.getUndeployCmd('target', `${projectName}-${projectVersion}.war`)
        return new vscode.ShellExecution(cmd,  { cwd })
    }

    getUndeployCmd(dir: string, file: string): string {
        const path = `${dir}/${file}`
        switch (this.config("deploy.mode")) {
            case 'gears-cli': 
                return `gears runtime undeploy ${path}`
            case 'maven':
                return 'mvn org.wildfly.plugins:wildfly-maven-plugin:2.0.2.Final:undeploy'
            default:
                const docker = this.config('docker')
                return `${docker} exec -it gears-runtime rm /camunda/standalone/deployments/${file}`
        }
    }

    loadDataExecution(): Execution {
        const filePattern = this.config('file-pattern.data')
        const cwd = this.workspaceRoot
        const cmd = 'java -jar "${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar" ' + filePattern
        return new vscode.ShellExecution(cmd, { cwd })
    }

    runScenariosExecution(): Execution {
        const filePattern = this.config('file-pattern.scenarios')
        const cwd = this.workspaceRoot
        const cmd = 'java -jar "${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar" ' + filePattern
        return new vscode.ShellExecution(cmd, { cwd })
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
	name: string;
}
