import { join } from 'path'
import { promises } from 'fs'

const _filePattern: RegExp = /.*\.(js|ts)$/i
const _exludedFolderPattern: RegExp = /node_modules/i

async function getFilesFrom(directory: string): Promise<Array<string>> {
  const entries = await promises.readdir(directory, { withFileTypes: true })
  const files: Array<string> = []
  for (const entry of entries) {
    const resolved = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (_exludedFolderPattern.test(entry.name)) { continue }
      const filesFromDirectory = await getFilesFrom(resolved)
      files.push(...filesFromDirectory)
    } else {
      if (_filePattern.test(entry.name)) {
        files.push(resolved)
      }
    }
  }
  return files
}

async function findVariablesInFile(file: string): Promise<Array<string>> {
  const fileContents = await promises.readFile(file, { encoding: 'utf8' })
  const matcher = /env\.([\w\d_]+)/gim
  const matches = fileContents.matchAll(matcher)
  const variables = []
  for (const match of matches) {
    variables.push(match[0])
  }
  return variables
}

export async function findAllVariablesIn(directory: string): Promise<Array<string>> {
  const files = await getFilesFrom(directory)
  const result = await Promise.all(files.map(file => findVariablesInFile(file)))
  const variables = [...new Set(result
    .flat()
    .map(item => item.replace('env.', ''))
  )]

  return variables
}