import { executeShellCommand } from './CommandExecuter'
import { GetPodResponse } from './k8sInterface'
import { findAllVariablesIn } from './VariableFinder'
import { EOL } from 'os'
import { ExecutionOptions } from './ExecutionOptions'

export default class App {
  private readonly _options: ExecutionOptions

  constructor(options: ExecutionOptions) {
    this._options = options
  }

  private mergeVariables(variables: Array<string>, environment: string) {
    return environment
      .split('\n')
      .map(item => {
        const [key, ...values] = item.split('=')
        return {
          key, value: values.join('=')
        }
      })
      .filter(({ key }) => variables.includes(key))
  }

  private async getPodName(): Promise<string | undefined> {
    const podsResponse = await executeShellCommand([`kubectl get pods --selector=app=${this._options.applicationName} -o json`])
    const pods = JSON.parse(podsResponse) as GetPodResponse
    const podName = pods?.items[0]?.metadata?.name
    return podName
  }

  async execute(): Promise<string> {
    const variables = await findAllVariablesIn(this._options.directory)
    if (variables.length === 0) {
      throw new Error('Did not find any usage of environment variables inside the given directory')
    }

    const podName = await this.getPodName()
    if (podName === undefined) {
      throw new Error(`Did not find a pod for application ${this._options.applicationName}`)
    }

    const environmentVariables = await executeShellCommand([`kubectl exec ${podName} -- printenv`])
    const merged = this.mergeVariables(variables, environmentVariables)

    return merged
      .map(({ key, value }) => `${key}=${value}`)
      .sort()
      .join(EOL)
  }
}