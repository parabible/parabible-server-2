import { query } from "../database/connection.ts"
import { getVersificationSchemaIdFromModuleId } from "../helpers/moduleInfo.ts"
import { getTermSearchQuery } from "../helpers/termSearchQueryBuilder.ts"
import { getTextQuery } from "../helpers/parallelTextQueryBuilder.ts"
import { getWordQuery } from "../helpers/wordMapQueryBuilder.ts"

type ModuleWarmWords = {
	moduleId: number
	wids: number[]
}
type Params = {
	searchTerms: SearchTerm[]
	treeNodeType:
	| "phrase"
	| "clause"
	| "sentence"
	| "verse"
	| "parallel"
	parallelIdQuery: string
	moduleIds: number[]
	page: number
	pageSize: number
}
const get = ({
	searchTerms,
	treeNodeType,
	parallelIdQuery,
	moduleIds,
	page = 0,
	pageSize = 10,
}: Params) =>
	new Promise<TermSearchResponse>((mainResolve, mainReject) => {
		const versificationSchemaId = getVersificationSchemaIdFromModuleId(moduleIds[0])

		// Build and run the query
		const termSearchSql = getTermSearchQuery({
			searchTerms,
			treeNodeType,
			parallelIdQuery,
			versificationSchemaId,
			moduleIds,
			page,
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
					matchingWords: [],
					warmWords: [],
				})
			}

			const warmWords: ModuleWarmWords[] = []
			const findOrCreateModuleIndex = (moduleId: number) => {
				const index = warmWords.findIndex(ww => ww.moduleId === moduleId)
				if (index === -1) {
					warmWords.push({ moduleId: moduleId, wids: [] })
					return warmWords.length - 1
				}
				return index
			}
			data.forEach(d => {
				if (d.moduleId && d.warmWids?.length) {
					warmWords[findOrCreateModuleIndex(d.moduleId)].wids.push(...d.warmWids)
				}
			})

			const orderedResults = data.map(d => d.parallelIdSet || [])

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
					matchingWords,
					warmWords,
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