import { query } from "../database/connection.ts"

const wordFeatureDenylist = new Set([
	"word_uid",
	"module_id",
	"wid",
	"leader",
	"text",
	"trailer",
	"rid",
	"parallel_id",
	"phrase_function",
	"phrase_node_id",
	"clause_node_id",
	"sentence_node_id",
])

type Params = {
	moduleId: number,
	wid: number
}
const get = ({ moduleId, wid }: Params) => new Promise<WordResponse>((resolve, reject) => {

	query(`SELECT
				*
			FROM
				word_features
			WHERE
				module_id = ${moduleId}
			AND
				wid = ${wid}`,
	).then(response => {
		if (response.rows === 0) {
			return reject({
				response: {
					error: true,
					code: "WORD_NOT_FOUND",
					message: "An error occurred while trying to fetch the word."
				},
				status: 400
			})
		}
		const word = response.data[0]
		const responseWithoutEmpties = Object.keys(word)
			.filter(k => word[k] !== "" && !wordFeatureDenylist.has(k))
			.map(k => ({
				key: k,
				value: word[k]
			}))
		return resolve({
			data: responseWithoutEmpties
		})
	}).catch(e => {
		console.error(e)
		return reject({
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