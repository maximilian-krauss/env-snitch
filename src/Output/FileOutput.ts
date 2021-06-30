import { Output } from './OutputInterface'
import { EOL } from 'os'
import { promises } from 'fs'
import { ok } from 'assert'

export class FileOutput implements Output {
  private readonly _filePath: string

  constructor(filePath: string) {
    ok(filePath)
    this._filePath = filePath
  }

  async write(variables: Record<string, string>[]): Promise<void> {
    const output = variables
      .map(({ key, value }) => `${key}=${value}`)
      .sort()
      .join(EOL)

    await promises.writeFile(this._filePath, output, { encoding: 'utf8' })
  }
}