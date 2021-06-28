import { resolve, join } from 'path'
import { ok } from 'assert'
import { promises, existsSync } from 'fs'

export type ExecutionOptions = {
  directory: string,
  applicationName: string
}

async function getAppName(directory: string): Promise<string|null> {
  const packageJsonPath = join(directory, 'package.json')
  if (!existsSync(packageJsonPath)) return null
  const packageContents = await promises.readFile(packageJsonPath, { encoding: 'utf8' })
  const parsedPackage: Record<string, string> = JSON.parse(packageContents)
  return parsedPackage['name']
}

export async function fromCommandLineArguments(args: Array<string>): Promise<ExecutionOptions> {
  if (args.length === 2) throw new Error('No arguments have been provided')
  const [, , directory, ...flags] = args

  ok(directory, 'Expected a directory as first argument')
  const resolvedDirectory = resolve(directory)
  const parsedFlags: Record<string, string> = flags
    .map(flag => flag.split('='))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  const appName = parsedFlags['--appName'] || await getAppName(directory)
  ok(appName, 'Could not determine application name')

  return {
    directory: resolvedDirectory,
    applicationName: appName
  }
}