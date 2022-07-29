import { query } from "../database/connection.ts"
import { generateParallelIdQueryFromCorpora } from "../helpers/parallelIdQueryBuilder.ts"
import { getHighlightQuery } from "../helpers/highlightQueryBuilder.ts"
import { getVersificationSchemaIdFromPrimaryModule, getModuleIdsFromModules } from "../helpers/moduleInfo.ts"

const moduleHighlightsToArrayOfArrays = (searchTerms: SearchTerm[]) =>
	(moduleHighlights: ModuleHighlights) =>
		searchTerms.map(({ uid }, i) =>
			moduleHighlights[`w${i}`].map(wid => ({
				uid,
				module_id: moduleHighlights.module_id,
				wid
			}))
		)

type Params = {
	searchTerms: SearchTerm[]
	modules: string
	corpusFilter: string
}
const get = ({ searchTerms, corpusFilter, modules }: Params) =>
	new Promise<HighlightResponse>((resolve, reject) => {
		const moduleIds = getModuleIdsFromModules(modules)
		const versificationSchemaId = getVersificationSchemaIdFromPrimaryModule(moduleIds[0])
		const parallelIdQuery = generateParallelIdQueryFromCorpora({ corpusFilter, versificationSchemaId })
		const q = getHighlightQuery({ searchTerms, parallelIdQuery, moduleIds, versificationSchemaId })
		console.log(q)
		query(q).then((highlights: ClickhouseResponse<HighlightQueryResult>) => {
			resolve({
				data: highlights.data.map(moduleHighlightsToArrayOfArrays(searchTerms)).flat(2)
			})
		}).catch(reject)
	})
export { get }