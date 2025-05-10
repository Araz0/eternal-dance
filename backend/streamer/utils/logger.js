export function logger(...args) {
  const timestamp = new Date().toISOString()
  console.log(`\x1b[36m[${timestamp}]\x1b[0m`, ...args)
}
