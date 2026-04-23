export async function register() {
  // Opt-out for environments where no database is available (e.g. visual
  // testing against a fresh build). Never set in production.
  if (process.env.SKIP_INSTRUMENTATION === 'true') {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createDefaultUser } = await import('./app/src/consumers/postgresConsumer');

    await createDefaultUser('default');
    console.log('Instrumentations: Default user ensured');
  }
}
