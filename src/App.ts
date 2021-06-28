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

  async execute(): Promise<string> {
    const variables = await findAllVariablesIn(this._options.directory)

    const podsResponse = await executeShellCommand([`kubectl get pods --selector=app=${this._options.applicationName} -o json`])
    const pods = JSON.parse(podsResponse) as GetPodResponse
    const podName = pods?.items[0]?.metadata?.name

    const environmentVariables = await executeShellCommand([`kubectl exec ${podName} -- printenv`])
    const merged = this.mergeVariables(variables, environmentVariables)

    return merged
      .map(({ key, value }) => `${key}=${value}`)
      .sort()
      .join(EOL)
  }
}