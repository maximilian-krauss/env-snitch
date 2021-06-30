import App from './App'
import {fromCommandLineArguments} from './ExecutionOptions'

async function main() {
  const options = await fromCommandLineArguments(process.argv)
  const app = new App(options)
  return await app.execute()
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })