export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createDefaultUser } = await import('./app/src/consumers/postgresConsumer')

    await createDefaultUser('default')
    console.log('Instrumentations: Default user ensured')
  }
}