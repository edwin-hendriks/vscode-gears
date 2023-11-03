import * as vscode from 'vscode'
import * as fs      from 'fs'
import * as process from 'process'
import * as path    from 'path'

const workspaceRoot = vscode.workspace.rootPath;

export function loadGearsConfig(): any {
  const filename = `${workspaceRoot}/gears.json`
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

export function getRunnerCommand(gearsConfig: any, goal: string, target: string): string {
  const endpoint  = this.config(`runner.endpoint`)
  const extraArgs = this.config(`runner.extraArgs`)
  const pattern   = this.config(`runner.${goal}-pattern`)

  const version = gearsConfig.runnerVersion

  if (version.startsWith('0.')) {
    const jar = this.getRunnerJar(version)
    var cmd = `java -jar "${jar}"`
    if (endpoint)  cmd += ` --endpoint ${endpoint}`
    if (target)    cmd += ` --target ${target}`
    if (extraArgs) cmd += ` ${extraArgs}`
    cmd += ` --${goal} '${pattern}'`
    return cmd
  }
  else {
    var cmd = `mvn com.xlrit.gears.runtime:gears-maven-runner-plugin:${version}:${goal}`
    if (endpoint)  cmd += ` -Dgears.runner.endpoint=${endpoint}`
    if (target)    cmd += ` -Dgears.runner.target=${target}`
    if (extraArgs) cmd += ` ${extraArgs}`
    cmd += ` -Dgears.runner.pattern='${pattern}'`
    return cmd
  }
}

export function getGeneratedProjectDir(gearsConfig: any): string {
  const projectName = gearsConfig.projectName
  return `${workspaceRoot}/target/${projectName}`
}

export function getGeneratorJar(gearsConfig: any): string {
  const releasesDir = process.env.GEARS_RELEASES
  const version = gearsConfig.generatorVersion
  const jarName = `gears-generator-assembly-${version}.jar`
  return path.resolve(releasesDir, jarName)
}

export function getRunnerJar(version: string): string {
  const releasesDir = process.env.GEARS_RELEASES
  const jarName = `gears-runner-assembly-${version}.jar`
  return path.resolve(releasesDir, jarName)
}