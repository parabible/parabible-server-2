import { query } from "../database/connection.ts"

const get = () => new Promise((resolve, reject) => {
    query("SELECT NOW()").then(_ => {
        resolve({
            response: { error: false }
        })
    }).catch(_ => {
        reject({
            response: {
                error: true,
                code: "DATABASE_ERROR",
                message: "Could not connect to database"
            },
            status: 503
        })
    })
})
export { get }