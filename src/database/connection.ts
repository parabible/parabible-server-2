import type { ClickhouseResponse } from "../../types.d.ts";
const USERNAME = Deno.env.get("CLICKHOUSE_USER") || "admin";
const PASSWORD = Deno.env.get("CLICKHOUSE_PASSWORD") || "toor";
const SERVER_URL = Deno.env.get("CLICKHOUSE_URL") || "http://localhost:8123";
const MAX_EXECUTION_TIME = Number.parseInt(Deno.env.get("MAX_EXECUTION_TIME") || "") || 5;
const THREAD_LIMIT = 3;
const encoder = new TextEncoder();

const queryQueue: {
  query: string;
  resolve: (value: ClickhouseResponse<unknown>) => void;
  reject: (reason?: unknown) => void;
}[] = [];

let currentThreads = 0;
const runNextQuery = async () => {
  if (currentThreads >= THREAD_LIMIT) {
    return;
  }
  const nextQuery = queryQueue.shift();
  if (!nextQuery) {
    return;
  }

  currentThreads++;
  const { query, resolve, reject } = nextQuery;
  await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-ClickHouse-User": USERNAME,
      "X-ClickHouse-Key": PASSWORD,
    },
    body: encoder.encode(
      `${query} FORMAT JSON SETTINGS max_execution_time=${MAX_EXECUTION_TIME}`,
    ),
    signal: AbortSignal.timeout(MAX_EXECUTION_TIME * 1000),
  }).then((r) => r.json()).then((r: ClickhouseResponse<unknown>) => {
    resolve(r);
  }).catch((e) => {
    console.error("DATABASE ERROR");
    console.error(query);
    console.error(e);
    reject(e);
  });

  currentThreads--;
  runNextQuery();
};

const query = <T>(query: string) =>
  new Promise<ClickhouseResponse<T>>((resolve, reject) => {
    queryQueue.push({ query, resolve, reject });
    runNextQuery();
  });
export { query };
