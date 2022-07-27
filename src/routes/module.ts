import { query } from "../database/connection.ts"

const get = () => new Promise<ModuleResponse>((resolve, reject) => {
    query(`SELECT
			  module_id,
              abbreviation
			FROM
			  module_info`,
    ).then((response: ClickhouseResponse<ModuleQueryResponse>) => {
        // response has a bunch of other stuff that we don't want to send in resolve
        resolve({ data: response.data })
    }).catch(error => {
        console.log("ERROR", error)
        reject({
            response: {
                error: true,
                code: "DATABASE_ERROR",
                message: "An error has occurred in the connection with the database."
            },
            status: 500
        })
    })
})
export { get }