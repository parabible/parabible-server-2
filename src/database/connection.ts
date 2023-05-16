import type { ClickhouseResponse } from "../../types.d.ts";
const USERNAME = Deno.env.get("CLICKHOUSE_USER") || "admin";
const PASSWORD = Deno.env.get("CLICKHOUSE_PASSWORD") || "toor";
const SERVER_URL = Deno.env.get("CLICKHOUSE_URL") || "http://localhost:8123";
const MAX_EXECUTION_TIME = Deno.env.get("MAX_EXECUTION_TIME") || 5;
const encoder = new TextEncoder();

const query = <T>(query: string) =>
  new Promise<ClickhouseResponse<T>>((resolve, reject) => {
    fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-ClickHouse-User": USERNAME,
        "X-ClickHouse-Key": PASSWORD,
      },
      body: encoder.encode(
        `${query} FORMAT JSON SETTINGS max_execution_time=${MAX_EXECUTION_TIME}`,
      ),
    }).then((r) => r.json()).then((r: ClickhouseResponse<T>) => {
      resolve(r);
    }).catch((e) => {
      console.error("DATABASE ERROR");
      console.error(query);
      console.error(e);
      reject(e);
    });
  });
export { query };
