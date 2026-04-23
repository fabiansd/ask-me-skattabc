/**
 * Self-contained monitoring report against the production Postgres on Fly.io.
 *
 * Spawns `flyctl proxy`, runs Prisma queries, writes reports/latest.json and a
 * Cursor canvas, then always tears down the proxy (exit/error/SIGINT/SIGTERM).
 *
 * Usage:
 *   npm run report -- --since 2026-04-21
 *   npm run report -- --since 2026-04-21 --limit 30
 */

import { spawn, ChildProcess } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import net from 'node:net';
import { config as loadEnv } from 'dotenv';

const REPO_ROOT = resolve(__dirname, '..');
const FLY_APP = 'skatt-abc-db';
const LOCAL_PORT = 5432;
const PROXY_READY_TIMEOUT_MS = 15_000;

loadEnv({ path: resolve(REPO_ROOT, '.env.monitor') });

if (!process.env.DATABASE_URL) {
  console.error(
    'ERROR: DATABASE_URL is not set. Create .env.monitor with a DATABASE_URL pointing at localhost:5432.',
  );
  process.exit(1);
}

type Args = { since: Date; limit: number };

function parseArgs(argv: string[]): Args {
  let sinceRaw = '2026-04-21';
  let limit = 20;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--since') sinceRaw = argv[++i];
    else if (a === '--limit') limit = Number(argv[++i]);
  }
  const since = new Date(sinceRaw);
  if (Number.isNaN(since.getTime())) {
    console.error(`Invalid --since date: ${sinceRaw}`);
    process.exit(1);
  }
  if (!Number.isFinite(limit) || limit <= 0) limit = 20;
  return { since, limit };
}

function waitForPort(port: number, host: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolvePromise, rejectPromise) => {
    const attempt = () => {
      const socket = net.connect({ port, host });
      socket.once('connect', () => {
        socket.destroy();
        resolvePromise();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() > deadline) {
          rejectPromise(new Error(`Port ${host}:${port} not reachable within ${timeoutMs}ms`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

function startProxy(): ChildProcess {
  const child = spawn(
    'flyctl',
    ['proxy', `${LOCAL_PORT}:5432`, '--app', FLY_APP],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  child.on('error', (err) => {
    console.error('Failed to start flyctl proxy:', err.message);
  });
  return child;
}

function killProxy(child: ChildProcess | null): void {
  if (!child || child.killed) return;
  try {
    child.kill('SIGTERM');
  } catch {
    /* noop */
  }
}

function registerCleanup(child: ChildProcess): void {
  const cleanup = () => killProxy(child);
  process.once('exit', cleanup);
  process.once('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.once('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });
  process.once('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    cleanup();
    process.exit(1);
  });
}

type DailyRow = { day: Date; n: number };
type AuthSplitRow = { auth_provider: string; n: number };
type TopUserRow = {
  user_id: number;
  username: string;
  created_at: Date;
  queries_in_range: number;
  last_activity: Date | null;
};
type FeedbackRow = {
  feedback_id: number;
  created_at: Date | null;
  happiness_feedback: string | null;
  desired_features: string | null;
  username: string;
};

async function runReport(since: Date, limit: number) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const [
      totalUsersRow,
      totalQueriesRow,
      totalFeedbackRow,
      newUsersRow,
      queriesInRangeRow,
      feedbackInRangeRow,
      authSplit,
      dailySignups,
      dailyQueries,
      topActiveUsers,
      feedbackItems,
    ] = await Promise.all([
      prisma.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM users`,
      prisma.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM query_history`,
      prisma.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM user_feedback`,
      prisma.$queryRaw<{ n: number }[]>`
        SELECT COUNT(*)::int AS n FROM users WHERE created_at >= ${since}`,
      prisma.$queryRaw<{ n: number }[]>`
        SELECT COUNT(*)::int AS n FROM query_history WHERE created_at >= ${since}`,
      prisma.$queryRaw<{ n: number }[]>`
        SELECT COUNT(*)::int AS n FROM user_feedback WHERE created_at >= ${since}`,
      prisma.$queryRaw<AuthSplitRow[]>`
        SELECT auth_provider, COUNT(*)::int AS n
        FROM users GROUP BY auth_provider ORDER BY n DESC`,
      prisma.$queryRaw<DailyRow[]>`
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS n
        FROM users WHERE created_at >= ${since}
        GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw<DailyRow[]>`
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS n
        FROM query_history WHERE created_at >= ${since}
        GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw<TopUserRow[]>`
        SELECT u.user_id, u.username, u.created_at,
               COUNT(qh.history_id)::int AS queries_in_range,
               MAX(qh.created_at) AS last_activity
        FROM users u
        LEFT JOIN query_history qh
          ON qh.user_id = u.user_id AND qh.created_at >= ${since}
        GROUP BY u.user_id, u.username, u.created_at
        ORDER BY queries_in_range DESC, u.created_at DESC
        LIMIT ${limit}`,
      prisma.$queryRaw<FeedbackRow[]>`
        SELECT f.feedback_id, f.created_at, f.happiness_feedback, f.desired_features, u.username
        FROM user_feedback f
        JOIN users u ON u.user_id = f.user_id
        WHERE f.created_at >= ${since}
        ORDER BY f.created_at DESC`,
    ]);

    return {
      generatedAt: new Date().toISOString(),
      since: since.toISOString(),
      totals: {
        users: totalUsersRow[0]?.n ?? 0,
        queries: totalQueriesRow[0]?.n ?? 0,
        feedback: totalFeedbackRow[0]?.n ?? 0,
      },
      inRange: {
        newUsers: newUsersRow[0]?.n ?? 0,
        queries: queriesInRangeRow[0]?.n ?? 0,
        feedback: feedbackInRangeRow[0]?.n ?? 0,
      },
      authProviderSplit: authSplit,
      dailySignups: dailySignups.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        n: r.n,
      })),
      dailyQueries: dailyQueries.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        n: r.n,
      })),
      topActiveUsers: topActiveUsers.map((r) => ({
        user_id: r.user_id,
        username: r.username,
        created_at: r.created_at.toISOString(),
        queries_in_range: r.queries_in_range,
        last_activity: r.last_activity ? r.last_activity.toISOString() : null,
      })),
      feedback: feedbackItems.map((r) => ({
        feedback_id: r.feedback_id,
        username: r.username,
        created_at: r.created_at ? r.created_at.toISOString() : null,
        happiness: r.happiness_feedback,
        desired_features: r.desired_features,
      })),
    };
  } finally {
    await prisma.$disconnect();
  }
}

type Report = Awaited<ReturnType<typeof runReport>>;

function formatSummary(report: Report): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(`== skatt-abc monitoring report ==`);
  lines.push(`generated:  ${report.generatedAt}`);
  lines.push(`since:      ${report.since}`);
  lines.push('');
  lines.push(
    `totals:     users=${report.totals.users}  queries=${report.totals.queries}  feedback=${report.totals.feedback}`,
  );
  lines.push(
    `in range:   newUsers=${report.inRange.newUsers}  queries=${report.inRange.queries}  feedback=${report.inRange.feedback}`,
  );
  lines.push('');
  lines.push('auth providers:');
  for (const row of report.authProviderSplit) {
    lines.push(`  ${row.auth_provider.padEnd(10)} ${row.n}`);
  }
  lines.push('');
  lines.push('daily signups in range:');
  for (const row of report.dailySignups) {
    lines.push(`  ${row.day}  ${row.n}`);
  }
  lines.push('');
  lines.push('daily queries in range:');
  for (const row of report.dailyQueries) {
    lines.push(`  ${row.day}  ${row.n}`);
  }
  lines.push('');
  lines.push('top active users in range:');
  const header = `  ${'user_id'.padEnd(8)} ${'username'.padEnd(30)} ${'created_at'.padEnd(20)} ${'queries'.padStart(8)}  last_activity`;
  lines.push(header);
  for (const u of report.topActiveUsers) {
    lines.push(
      `  ${String(u.user_id).padEnd(8)} ${u.username.slice(0, 30).padEnd(30)} ${u.created_at.slice(0, 19).padEnd(20)} ${String(u.queries_in_range).padStart(8)}  ${u.last_activity ? u.last_activity.slice(0, 19) : '-'}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function writeJson(report: Report): string {
  const outPath = resolve(REPO_ROOT, 'reports/latest.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  return outPath;
}

function workspaceCanvasDir(): string {
  return resolve(
    homedir(),
    '.cursor/projects/Users-fabiansodaldietrichson-develop-optimalskatt-ask-me-skattabc/canvases',
  );
}

function writeCanvas(report: Report): string | null {
  const dir = workspaceCanvasDir();
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    return null;
  }
  const outPath = resolve(dir, 'skatt-monitoring.canvas.tsx');
  const data = JSON.stringify(report, null, 2);
  const tsx = `import { Divider, Grid, H1, H2, Stack, Stat, Table, Text } from 'cursor/canvas';

const report = ${data} as const;

function fmtDate(iso: string | null): string {
  if (!iso) return '-';
  return iso.slice(0, 10);
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '-';
  return iso.replace('T', ' ').slice(0, 16);
}

export default function SkattMonitoring() {
  const sinceLabel = fmtDate(report.since);
  return (
    <Stack gap={24}>
      <Stack gap={4}>
        <H1>skatt-abc monitoring</H1>
        <Text tone="secondary" size="small">
          since {sinceLabel} · generated {fmtDateTime(report.generatedAt)} · source: skatt-abc-db (prod)
        </Text>
      </Stack>

      <Grid columns={3} gap={16}>
        <Stat value={String(report.inRange.newUsers)} label={\`new users since \${sinceLabel}\`} tone="success" />
        <Stat value={String(report.inRange.queries)} label={\`queries since \${sinceLabel}\`} />
        <Stat value={String(report.inRange.feedback)} label={\`feedback since \${sinceLabel}\`} />
        <Stat value={String(report.totals.users)} label="total users" />
        <Stat value={String(report.totals.queries)} label="total queries" />
        <Stat value={String(report.totals.feedback)} label="total feedback" />
      </Grid>

      <Divider />

      <H2>daily signups</H2>
      {report.dailySignups.length === 0 ? (
        <Text tone="secondary">no signups in range</Text>
      ) : (
        <Table
          headers={['day', 'new users']}
          rows={report.dailySignups.map((r) => [r.day, String(r.n)])}
        />
      )}

      <H2>daily queries</H2>
      {report.dailyQueries.length === 0 ? (
        <Text tone="secondary">no queries in range</Text>
      ) : (
        <Table
          headers={['day', 'queries']}
          rows={report.dailyQueries.map((r) => [r.day, String(r.n)])}
        />
      )}

      <Divider />

      <H2>auth providers</H2>
      <Table
        headers={['provider', 'users']}
        rows={report.authProviderSplit.map((r) => [r.auth_provider, String(r.n)])}
      />

      <Divider />

      <H2>top active users in range</H2>
      {report.topActiveUsers.length === 0 ? (
        <Text tone="secondary">no users</Text>
      ) : (
        <Table
          headers={['user_id', 'username', 'created', 'queries', 'last activity']}
          rows={report.topActiveUsers.map((u) => [
            String(u.user_id),
            u.username,
            fmtDate(u.created_at),
            String(u.queries_in_range),
            fmtDateTime(u.last_activity),
          ])}
        />
      )}

      {report.feedback.length > 0 ? (
        <Stack gap={12}>
          <Divider />
          <H2>feedback in range</H2>
          <Table
            headers={['when', 'user', 'happiness', 'desired features']}
            rows={report.feedback.map((f) => [
              fmtDateTime(f.created_at),
              f.username,
              f.happiness ?? '-',
              f.desired_features ?? '-',
            ])}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
`;
  writeFileSync(outPath, tsx);
  return outPath;
}

async function main() {
  const { since, limit } = parseArgs(process.argv.slice(2));

  console.log(`Starting flyctl proxy to ${FLY_APP} on localhost:${LOCAL_PORT}...`);
  const child = startProxy();
  registerCleanup(child);

  try {
    await waitForPort(LOCAL_PORT, '127.0.0.1', PROXY_READY_TIMEOUT_MS);
    console.log('Proxy ready. Querying...');

    const report = await runReport(since, limit);

    const jsonPath = writeJson(report);
    const canvasPath = writeCanvas(report);

    console.log(formatSummary(report));
    console.log(`json:    ${jsonPath}`);
    if (canvasPath) {
      console.log(`canvas:  ${canvasPath}`);
    }
  } finally {
    killProxy(child);
  }
}

main().catch((err) => {
  console.error('Report failed:', err);
  process.exit(1);
});
