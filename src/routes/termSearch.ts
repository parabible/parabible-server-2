import { query } from "../database/connection.ts"
import { getVersificationSchemaIdFromModuleId, getModuleIdsFromModules } from "../helpers/moduleInfo.ts"
import { generateParallelIdQueryFromCorpora } from "../helpers/parallelIdQueryBuilder.ts"
import { getTermSearchQuery } from "../helpers/termSearchQueryBuilder.ts"
import { getTextQuery } from "../helpers/parallelTextQueryBuilder.ts"
import { getWordQuery } from "../helpers/wordMapQueryBuilder.ts"

type Params = {
	searchTerms: SearchTerm[]
	treeNodeType:
	| "phrase"
	| "clause"
	| "sentence"
	| "verse"
	| "parallel"
	modules: string
	corpusFilter: string
	pageNumber: number
	pageSize: number
}
const get = ({
	searchTerms,
	treeNodeType,
	modules,
	corpusFilter = "",
	pageNumber = 0,
	pageSize = 10,
}: Params) =>
	new Promise<TermSearchResponse>((mainResolve, mainReject) => {
		const moduleIds = getModuleIdsFromModules(modules)
		const versificationSchemaId = getVersificationSchemaIdFromModuleId(moduleIds[0])
		const parallelIdQuery = generateParallelIdQueryFromCorpora({ corpusFilter, moduleIds })

		// Build and run the query
		const termSearchSql = getTermSearchQuery({
			searchTerms,
			treeNodeType,
			parallelIdQuery,
			moduleIds,
			versificationSchemaId,
			pageNumber,
			pageSize
		})

		query(termSearchSql).then((matchingSyntaxNodes: ClickhouseResponse<TermSearchQueryResult>) => {
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
				new Promise<WordQueryResult>((resolve, reject) => {
					const wordUids = searchTerms.map((_, i) => data.map(d => d[`w${i}`])).flat(3)
					const wordQuery = getWordQuery({ wordUids })
					query(wordQuery).then((wordResult: ClickhouseResponse<WordQueryResult>) => {
						resolve(wordResult["data"])
					}).catch(reject)
				}),
				new Promise<ParallelTextQueryResult>((resolve, reject) => {
					const parallelIds = orderedResults.flat()
					const parallelTextQuery = getTextQuery({ moduleIds, parallelIds })
					query(parallelTextQuery).then((parallelTextResult: ClickhouseResponse<ParallelTextQueryResult>) => {
						resolve(parallelTextResult.data)
					}).catch(reject)
				})
			]).then(([matchingWords, matchingText]: [
				matchingWords: WordQueryResult,
				matchingText: ParallelTextQueryResult
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
			console.error("Error while searching for terms")
			mainReject(error)
		})
	})
export { get }