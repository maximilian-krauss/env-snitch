import { Output } from './OutputInterface'
import { EOL } from 'os'

export class StdOutput implements Output {
  async write(variables: Array<Record<string, string>>): Promise<void> {
    const output = variables
      .map(({ key, value }) => `${key}=${value}`)
      .sort()
      .join(EOL)

    console.log(output)
  }
}