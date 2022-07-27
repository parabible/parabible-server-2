import type { ClickhouseResponse } from "../../types.d.ts"
const PROTOCOL = "http"
const USERNAME = "admin"
const PASSWORD = "toor"
const SERVER_URL = "localhost:8123"

const query = <T>(query: string) => new Promise<ClickhouseResponse<T>>((resolve, reject) => {
    const queryString = PROTOCOL + "://" +
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
        console.error(queryString)
        console.error(e)
        reject(e)
    })
})
export { query }