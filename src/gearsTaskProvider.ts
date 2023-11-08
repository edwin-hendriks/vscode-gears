import * as vscode  from 'vscode'
import * as path    from 'path'
import * as utils   from './gearsUtils'
import { Config }   from './common'

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
            console.debug("Created task: {}", task)
            return task
        }

        const gearsConfig = utils.loadGearsConfig()
        if (!gearsConfig) {
            console.error("gears.json is required to provide tasks")
            return []
        }
        
        const tasks = [
            createTask('1. Generate',                    this.generateExecution(gearsConfig)),
            createTask('2. Copy Resources',              this.copyResourcesExecution(gearsConfig)),
            createTask('3. Show Diagrams',               this.diagramsExecution()),
            createTask('4. Build',                       this.buildExecution(gearsConfig)),
            createTask('5. Start Application',           this.startExecution(gearsConfig)),
            createTask('6. Load data',                   this.loadDataExecution(gearsConfig, null)),
            createTask('7. Run Scenarios',               this.runScenariosExecution(gearsConfig, null)),
            createTask('8. Run Scenarios with Selenide', this.runScenariosExecution(gearsConfig, "selenide")),
            createTask('9. Open Generated Code',         this.openCodeExecution(gearsConfig)),
        ]
        
        //console.log("provideTasks: ", tasks)
        return tasks
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        // A valid default implementation for the `resolveTask` method is to return `undefined`.
        return undefined
    }

    generateExecution(gearsConfig: any): Execution {
        const cwd            = this.workspaceRoot
        const configFile     = path.relative(cwd, gearsConfig.filename)
        const filter         = this.config('generator.filter')
        const extraArgs      = this.config('generator.extraArgs')
        const generatorJar   = utils.getGeneratorJar(gearsConfig)
        
        var cmd = `java -jar "${generatorJar}"`
        if (configFile) cmd += ` --config ${configFile}`
        if (filter)     cmd += ` --filter ${filter}`
        if (extraArgs)  cmd += ` ${extraArgs}`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    copyResourcesExecution(gearsConfig: any): Execution {
        const cwd            = this.workspaceRoot
        const configFile     = path.relative(cwd, gearsConfig.filename)
        const generatorJar   = utils.getGeneratorJar(gearsConfig)
        
        var cmd = `java -jar "${generatorJar}"`
        if (configFile) cmd += ` --config ${configFile}`
        cmd += ` --copy-resources`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    diagramsExecution(): Execution {
        const cwd     = this.workspaceRoot
        const browser = this.config('browser')
        const page    = `${this.workspaceRoot}/target/diagrams/index.html`
        const cmd     = `${browser} ${page}`
        return new vscode.ShellExecution(cmd, { cwd })
    }

    buildExecution(gearsConfig: any): Execution {
        const cwd = utils.getGeneratedProjectDir(gearsConfig)
        const cmd = 'mvn clean package'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    startExecution(gearsConfig: any): Execution {
        const cwd      = utils.getGeneratedProjectDir(gearsConfig)
        const profiles = this.config('run.profiles')
        
        var cmd = 'mvn spring-boot:run'
        if (profiles) cmd += ` -Dspring-boot.run.profiles=${profiles}`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    stopExecution(gearsConfig: any): Execution {
        const cwd = utils.getGeneratedProjectDir(gearsConfig)
        const cmd = 'mvn spring-boot:stop'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    loadDataExecution(gearsConfig: any, target: string): Execution {
        const cwd = this.workspaceRoot
        const cmd = utils.getRunnerCommand(gearsConfig, 'load', target)

        return new vscode.ShellExecution(cmd, { cwd })
    }

    runScenariosExecution(gearsConfig: any, target: string): Execution {
        const cwd = this.workspaceRoot
        const cmd = utils.getRunnerCommand(gearsConfig, 'run', target)
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    openCodeExecution(gearsConfig: any): Execution {
        const cwd = this.workspaceRoot
        const dir = utils.getGeneratedProjectDir(gearsConfig)
        var cmd = `code ${dir}`
        return new vscode.ShellExecution(cmd, { cwd })
      }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
    name: string;
}
