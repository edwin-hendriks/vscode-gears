import * as vscode  from 'vscode'
import * as fs      from 'fs'
import * as path    from 'path'
import * as process from 'process'
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

        const gearsConfig = this.loadGearsConfig()
        if (!gearsConfig) {
            console.error("gears.json is required to provide tasks")
            return []
        }
        
        const tasks = [
            createTask('1. Generate',           this.generateExecution(gearsConfig)),
            createTask('2. Copy Resources',     this.copyResourcesExecution(gearsConfig)),
            createTask('3. Show Diagrams',      this.diagramsExecution()),
            createTask('4. Build',              this.buildExecution(gearsConfig)),
            createTask('5. Start Application',  this.startExecution(gearsConfig)),
            createTask('6. Load data',          this.loadDataExecution(gearsConfig)),
            createTask('7. Run Scenarios',      this.runScenariosExecution(gearsConfig)),
            //createTask('7. Stop Application',  this.stopExecution(gearsConfig)),
        ]
        
        //console.log("provideTasks: ", tasks)
        return tasks
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        // A valid default implementation for the `resolveTask` method is to return `undefined`.
        return undefined
    }

    loadGearsConfig(): any {
        const filename = `${this.workspaceRoot}/gears.json`
        if (!fs.existsSync(filename)) {
            console.log("No gears.json found in workspace root")
            return undefined
        }
        else {
            const data = fs.readFileSync(filename)
            const config = JSON.parse(data.toString())
            console.log("GEARS config", config)
            config.filename = filename
            return config
        }
    }

    generateExecution(gearsConfig: any): Execution {
        const cwd            = this.workspaceRoot
        const configFile     = path.relative(cwd, gearsConfig.filename)
        const filter         = this.config('generator.filter')
        const extraArgs      = this.config('generator.extraArgs')
        const generatorJar   = this.getGeneratorJar(gearsConfig)
        
        var cmd = `java -jar "${generatorJar}"`
        if (configFile) cmd += ` --config ${configFile}`
        if (filter)     cmd += ` --filter ${filter}`
        if (extraArgs)  cmd += ` ${extraArgs}`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    copyResourcesExecution(gearsConfig: any): Execution {
        const cwd            = this.workspaceRoot
        const configFile     = path.relative(cwd, gearsConfig.filename)
        const generatorJar   = this.getGeneratorJar(gearsConfig)
        
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
        const cwd = this.getGeneratedProjectDir(gearsConfig)
        const cmd = 'mvn clean package'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    startExecution(gearsConfig: any): Execution {
        const cwd      = this.getGeneratedProjectDir(gearsConfig)
        const profiles = this.config('run.profiles')
        
        var cmd = 'mvn spring-boot:run'
        if (profiles) cmd += ` -Dspring-boot.run.profiles=${profiles}`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    stopExecution(gearsConfig: any): Execution {
        const cwd = this.getGeneratedProjectDir(gearsConfig)
        const cmd = 'mvn spring-boot:stop'
        return new vscode.ShellExecution(cmd, { cwd })
    }

    loadDataExecution(gearsConfig: any): Execution {
        const endpoint    = this.config('runner.endpoint')
        const extraArgs   = this.config('runner.extraArgs')
        const loadPattern = this.config('runner.load-pattern')

        const cwd = this.workspaceRoot
        const jar = this.getRunnerJar(gearsConfig)

        var cmd = `java -jar "${jar}"`
        if (endpoint)  cmd += ` --endpoint ${endpoint}`
        if (extraArgs) cmd += ` ${extraArgs}`
        cmd += ` --load '${loadPattern}'`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    runScenariosExecution(gearsConfig: any): Execution {
        const endpoint   = this.config('runner.endpoint')
        const extraArgs  = this.config('runner.extraArgs')
        const runPattern = this.config('runner.run-pattern')
        
        const cwd = this.workspaceRoot
        const jar = this.getRunnerJar(gearsConfig)
        
        var cmd = `java -jar "${jar}"`
        if (endpoint)  cmd += ` --endpoint ${endpoint}`
        if (extraArgs) cmd += ` ${extraArgs}`
        cmd += ` --run '${runPattern}'`
        
        return new vscode.ShellExecution(cmd, { cwd })
    }

    getGeneratedProjectDir(gearsConfig: any): string {
        const projectName = gearsConfig.projectName
        return `${this.workspaceRoot}/target/${projectName}`
    }

    getGeneratorJar(gearsConfig: any): string {
        const releasesDir = process.env.GEARS_RELEASES
        const version = gearsConfig.generatorVersion
        const jarName = `gears-generator-assembly-${version}.jar`
        return path.resolve(releasesDir, jarName)
    }

    getRunnerJar(gearsConfig: any): string {
        const releasesDir = process.env.GEARS_RELEASES
        const version = gearsConfig.runnerVersion
        const jarName = `gears-runner-assembly-${version}.jar`
        return path.resolve(releasesDir, jarName)
    }
}

interface GearsTaskDefinition extends vscode.TaskDefinition {
    name: string;
}
