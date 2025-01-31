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
            createTask('1. Generate',            this.generateExecution(gearsConfig)),
            createTask('2. Copy Resources',      this.copyResourcesExecution(gearsConfig)),
            createTask('3. Show Diagrams',       this.diagramsExecution(gearsConfig)),
            createTask('4. Build',               this.buildExecution(gearsConfig)),
            createTask('5. Start Application',   this.startExecution(gearsConfig)),
            createTask('6. Load data',           this.runnerExecution(gearsConfig, 'load')),
            createTask('7. Run Scenarios',       this.runnerExecution(gearsConfig, 'run')),
            createTask('8. Export data',         this.runnerExecution(gearsConfig, 'export')),
            createTask('9. Open Generated Code', this.openCodeExecution(gearsConfig)),
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
        const startCmd       = this.config('generator.startCmd')
        const filter         = this.config('generator.filter')
        const extraArgs      = this.config('generator.extraArgs')
        
        var cmd = startCmd.replace("%GEARS_RELEASES%", process.env.GEARS_RELEASES).replace("%VERSION%", gearsConfig.generatorVersion)
        if (configFile) cmd += ` --config ${configFile}`
        if (filter)     cmd += ` --filter ${filter}`
        if (extraArgs)  cmd += ` ${extraArgs}`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    copyResourcesExecution(gearsConfig: any): Execution {
        const cwd            = this.workspaceRoot
        const startCmd       = this.config('generator.startCmd')
        const configFile     = path.relative(cwd, gearsConfig.filename)
        
        var cmd = startCmd.replace("%GEARS_RELEASES%", process.env.GEARS_RELEASES).replace("%VERSION%", gearsConfig.generatorVersion)
        if (configFile) cmd += ` --config ${configFile}`
        cmd += ` --copy-resources`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    diagramsExecution(gearsConfig: any): Execution {
        const cwd     = this.workspaceRoot
        const browser = this.config('browser')
        const page    = `${utils.getGeneratedProjectDir(gearsConfig)}/diagrams/index.html`
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

    runnerExecution(gearsConfig: any, goal: string): Execution {
        const cwd = this.workspaceRoot
        const cmd = this.getRunnerCommand(gearsConfig, goal)

        return new vscode.ShellExecution(cmd, { cwd })
    }

    openCodeExecution(gearsConfig: any): Execution {
        const cwd = this.workspaceRoot
        const dir = utils.getGeneratedProjectDir(gearsConfig)
        var cmd = `code ${dir}`
        return new vscode.ShellExecution(cmd, { cwd })
      }

    getRunnerCommand(gearsConfig: any, goal: string): string {
    const endpoint  = this.config(`runner.endpoint`)
    const extraArgs = this.config(`runner.extraArgs`)
    const pattern   = this.config(`runner.${goal}-pattern`)
    
    const version = gearsConfig.runnerVersion
    
    var cmd = `mvn com.xlrit.gears.runtime:gears-maven-runner-plugin:${version}:${goal}`
        if (endpoint)  cmd += ` -Dgears.runner.endpoint=${endpoint}`
        if (extraArgs) cmd += ` ${extraArgs}`
        cmd += ` -Dgears.runner.pattern='${pattern}'`
        return cmd
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
    name: string;
}
