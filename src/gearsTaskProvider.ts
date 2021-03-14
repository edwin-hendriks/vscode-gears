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
        // TODO task to make sure Runtime (with correct version) is running?
        return [
            createTask('1. Generate',      this.getGenerateExecution()),
            createTask('2. Diagrams',      this.getDiagramsExecution()),
            createTask('3. Build',         this.getBuildExecution()),
            createTask('4. Deploy',        this.getDeployExecution()),
            createTask('5. Load data',     this.getLoadDataExecution()),
            createTask('6. Run scenarios', this.getRunScenariosExecution()),
            createTask('7. Undeploy',      this.getUndeployExecution()),
        ];
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        const def = task.definition
        const newTask = new vscode.Task(def, task.scope, def.name, def.type, task.execution);
        newTask.group = task.group;
        return newTask;
    }

    getGenerateExecution(): Execution {
        const projectName    = this.config('project.name')
        const projectVersion = this.config('project.version')
        const generatorJar   = this.getGeneratorJar()
        const cwd = this.workspaceRoot
        const cmd = `java -jar "${generatorJar}" -name ${projectName} -version ${projectVersion} *.sn`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getGeneratorJar(): String {
        const generatorVersion = this.config('generator.version')
        return "${env:GEARS_RELEASES}/gears-generator-assembly-" + generatorVersion + ".jar"
    }

    getDiagramsExecution(): Execution {
        const cwd     = this.workspaceRoot
        const browser = this.config('browser')
        const page    = `${this.workspaceRoot}/target/diagrams/index.html`
        const cmd     = `${browser} ${page}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getBuildExecution(): Execution {
        const projectName = this.config('project.name')
        const cwd = `${this.workspaceRoot}/target/${projectName}`
        const cmd = 'mvn clean package'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getDeployExecution(): Execution {
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

    getUndeployExecution(): Execution {
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

    getLoadDataExecution(): Execution {
        const filePattern = this.config('file-pattern.data')
        const cwd = this.workspaceRoot
        const cmd = 'java -jar "${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar" ' + filePattern
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getRunScenariosExecution(): Execution {
        const filePattern = this.config('file-pattern.scenarios')
        const cwd = this.workspaceRoot
        const cmd = 'java -jar "${env:GEARS_RELEASES}/gears-runner-assembly-${config:gears.runner.version}.jar" ' + filePattern
        return new vscode.ShellExecution(cmd, { cwd })
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
	name: string;
}
