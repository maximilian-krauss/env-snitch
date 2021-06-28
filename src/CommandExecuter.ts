import { exec } from 'child_process'

export function executeShellCommand(args: string[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(args.join(' '), (error, stdout, stderr) => {
      if (error) return reject(error)
      if (stderr) return reject(new Error(stderr))
      resolve(stdout)
    })
  })
}
