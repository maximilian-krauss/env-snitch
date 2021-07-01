import { resolve, join } from 'path'
import { ok } from 'assert'
import { promises, existsSync } from 'fs'
import { Output } from './Output/OutputInterface'
import { StdOutput } from './Output/StdOutput'
import { FileOutput } from './Output/FileOutput'

export type ExecutionOptions = {
  directory: string
  applicationName: string
  outputDestinations: Output[]
  ignoreMissingVariables: boolean
}

async function getAppName(directory: string): Promise<string | null> {
  const packageJsonPath = join(directory, 'package.json')
  if (!existsSync(packageJsonPath)) return null
  const packageContents = await promises.readFile(packageJsonPath, { encoding: 'utf8' })
  const parsedPackage: Record<string, string> = JSON.parse(packageContents)
  return parsedPackage['name']
}

export async function fromCommandLineArguments(args: Array<string>): Promise<ExecutionOptions> {
  if (args.length === 2) throw new Error('No arguments have been provided')

  const [, , directory, ...flags] = args
  const outputDestinations: Array<Output> = [ new StdOutput() ]

  ok(directory, 'Expected a directory as first argument')

  const resolvedDirectory = resolve(directory)
  const parsedFlags: Record<string, string> = flags
    .map(flag => flag.split('='))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  const appName = parsedFlags['--appName'] || await getAppName(directory)
  ok(appName, 'Could not determine application name')

  const fileFlag = parsedFlags['--file']
  if (fileFlag !== undefined) {
    outputDestinations.push(new FileOutput(join(resolvedDirectory, fileFlag)))
  }

  const ignoreMissingVariables = Object.keys(parsedFlags).includes('--ignoreMissing')

  return {
    outputDestinations,
    ignoreMissingVariables,
    directory: resolvedDirectory,
    applicationName: appName
  }
}