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

export function getGeneratedProjectDir(gearsConfig: any): string {
  const projectName = gearsConfig.projectName
  const workspaceRootForwardSlashes =  workspaceRoot.replace(/\\/g, "/");
  return `${workspaceRootForwardSlashes}/target/${projectName}`
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