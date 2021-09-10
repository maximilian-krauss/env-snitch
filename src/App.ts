import { executeShellCommand } from './CommandExecuter'
import { GetPodResponse } from './k8sInterface'
import { findAllVariablesIn } from './VariableFinder'
import { ExecutionOptions } from './ExecutionOptions'
import { EOL } from 'os'

export default class App {
  private readonly _options: ExecutionOptions
  private readonly _emptyVariableValue: string = '<NOT FOUND>'

  constructor(options: ExecutionOptions) {
    this._options = options
  }

  private mergeVariables(variables: Array<string>, environment: string): Array<Record<string, string>> {
    const environmentVariables: Record<string, string> = environment
      .split(EOL)
      .reduce((acc, next) => {
        const [key, ...values] = next.split('=')
        return {
          ...acc,
          [key]: values.join('=')
        }
      }, {})

    return variables
      .map(variable => ({
        key: variable,
        value: environmentVariables[variable] ?? this._emptyVariableValue
      }))
      .filter(({ value }) => !this._options.ignoreMissingVariables || value !== this._emptyVariableValue)
  }

  private async getPodName(): Promise<string | undefined> {
    const podsResponse = await executeShellCommand(`kubectl get pods --selector=app=${this._options.applicationName} -o json`)
    const pods = JSON.parse(podsResponse) as GetPodResponse
    const podName = pods?.items[0]?.metadata?.name
    return podName
  }

  async execute(): Promise<void> {
    const variables = await findAllVariablesIn(this._options.directory, this._options.objectName)
    if (variables.length === 0) {
      throw new Error('Did not find any usage of environment variables inside the given directory')
    }

    const podName = await this.getPodName()
    if (podName === undefined) {
      throw new Error(`Did not find a pod for application ${this._options.applicationName}`)
    }

    const environmentVariables = await executeShellCommand(`kubectl exec ${podName} -- printenv`)
    const merged = this.mergeVariables(variables, environmentVariables)

    await Promise.all(this._options
      .outputDestinations
      .map(destination => destination.write(merged))
    )
  }
}