# env-snitch

Little snitch (not the network one) tool to help creating .env files from k8s and sourcecode.

## How to use

- Open a new terminal window
- Log into your kubernetes cluster of choice from which you want to extract the environment variables from (make sure that `kubectl` works)
- Run the following command `npx env-snitch@latest .` (the dot at the end passes the current directory to env-snitch but you can also specifiy any directory you want)

## How does it work?

`env-snitch` scans through all .js or .ts files in the given directory and searches for usages of environment variables (by accessing them via `(process).env.SOME_VARIABLE`). It then connects to k8s, looks for the pod running your application and extracts the environment variables from the pod and prints them into stdout.

## Possible options

Alongside the required directory as first argument you can pass the following parameter to `env-snitch`:

- **--appName** - Specifies the name of the application as it is labelled inside the kubernetes cluster. If not provided, env-snitch tries to use the `name` specified inside the `package.json`.
- **--file={FILENAME}** - You can specify an additional file to output the environment variables. The final path will then be combined between the given source code directory and the specified filename.

## Is this a good idea?

Probably not. You should never connect to production data and execute `env-snitch`. You actually circumvent any measure taken to protect secrets. But if you need to connect to your development stage it's the best approach to autogenerate an up2date .env file.
Use at your own risk.
