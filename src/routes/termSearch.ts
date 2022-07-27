import { query } from "../database/connection.ts"
import { getIdFromSchema } from "../helpers/versificationSchemas.ts"
import { getTermSearchQuery } from "../helpers/termSearchQueryBuilder.ts"
import { getTextQuery } from "../helpers/parallelTextQueryBuilder.ts"
import { getWordQuery } from "../helpers/wordMapQueryBuilder.ts"

type Params = {
	searchTerms: SearchTerm[],
	treeNodeType:
	| "phrase"
	| "clause"
	| "sentence"
	| "verse"
	| "parallel",
	modules: string,
	corpusFilter: string,
	versificationSchema: string
}
const get = ({ searchTerms, treeNodeType, modules, corpusFilter = "", versificationSchema }: Params) =>
	new Promise<TermSearchResponse>((mainResolve, mainReject) => {
		// TODO: convert module names to ids
		const moduleIds = [1, 3, 7]

		const versificationSchemaId = getIdFromSchema(versificationSchema)

		// Build and run the query
		const termSearchSql = getTermSearchQuery({
			searchTerms,
			treeNodeType,
			// parallelIdQuery,
			moduleIds,
			versificationSchemaId
		})

		query(termSearchSql).then((matchingSyntaxNodes: ClickhouseResponse<TermSearchQueryResponse>) => {
			const count = matchingSyntaxNodes.rows_before_limit_at_least || -1
			//TODO: const = theabove might not work if we don't have a result size > the limit... 
			// // (should test)
			const data = matchingSyntaxNodes["data"] || []

			if (data.length === 0) {
				return mainResolve({
					count: 0,
					orderedResults: [[]],
					matchingText: [],
					matchingWords: []
				})
			}

			const orderedResults = data.map(d => d["parallel_id_set"] || [])

			Promise.all([
				new Promise<WordQueryResponse>((resolve, reject) => {
					const wordUids = searchTerms.map((_, i) => data.map(d => d[`w${i}`])).flat(3)
					const wordQuery = getWordQuery({ wordUids })
					query(wordQuery).then((wordResult: ClickhouseResponse<WordQueryResponse>) => {
						resolve(wordResult["data"])
					}).catch(reject)
				}),
				new Promise<ParallelTextQueryResponse>((resolve, reject) => {
					const parallelIds = orderedResults.flat()
					const parallelTextQuery = getTextQuery({ moduleIds, parallelIds })
					query(parallelTextQuery).then((parallelTextResult: ClickhouseResponse<ParallelTextQueryResponse>) => {
						resolve(parallelTextResult.data)
					}).catch(reject)
				})
			]).then(([matchingWords, matchingText]: [
				matchingWords: WordQueryResponse,
				matchingText: ParallelTextQueryResponse
			]) => {
				mainResolve({
					count,
					orderedResults,
					matchingText,
					matchingWords
				})
			}).catch(error => {
				console.error("Error while gathering words and paralel text")
				console.error(error)
				mainReject(error)
			})
		}).catch(error => {
			console.log("Error while searching for terms")
			mainReject(error)
		})
	})
export { get }