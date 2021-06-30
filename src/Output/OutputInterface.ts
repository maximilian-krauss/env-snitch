export interface Output {
  write(variables: Array<Record<string, string>>): Promise<void>
}