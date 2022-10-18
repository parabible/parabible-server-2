import type { ClickhouseResponse } from "../../types.d.ts"
const USERNAME = Deno.env.get("CLICKHOUSE_USER") || "admin"
const PASSWORD = Deno.env.get("CLICKHOUSE_PASSWORD") || "toor"
const SERVER_URL = Deno.env.get("CLICKHOUSE_URL") || "http://localhost:8123"

const query = <T>(query: string) => new Promise<ClickhouseResponse<T>>((resolve, reject) => {
	const queryString =
		SERVER_URL +
		"/?query=" +
		encodeURIComponent(query + " FORMAT JSON")

	fetch(queryString, {
		headers: {
			"X-ClickHouse-User": USERNAME,
			"X-ClickHouse-Key": PASSWORD,
		}
	}).then(r => r.json()).then((r: ClickhouseResponse<T>) => {
		resolve(r)
	}).catch(e => {
		console.error("DATABASE ERROR")
		console.error(query)
		console.error(e)
		reject(e)
	})
})
export { query }