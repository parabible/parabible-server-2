import { query } from "../database/connection.ts"
import { generateParallelIdQueryFromCorpora } from "../helpers/parallelIdQueryBuilder.ts"
import { getTextQuery } from "../helpers/parallelTextQueryBuilder.ts"
import { getVersificationSchemaIdFromPrimaryModule, getModuleIdsFromModules } from "../helpers/moduleInfo.ts"

type Params = {
	modules: string
	corpusFilter: string
}
const get = ({ corpusFilter, modules }: Params) =>
	new Promise<TextResponse>((resolve, reject) => {
		const moduleIds = getModuleIdsFromModules(modules)
		const versificationSchemaId = getVersificationSchemaIdFromPrimaryModule(moduleIds[0])

		// Parallel_ids in getTextQuery could(conceivably) be a string query...
		// Maybe we should refactor to support that...
		const parallelIdSelectStatement = generateParallelIdQueryFromCorpora({ corpusFilter, versificationSchemaId })
		const q = getTextQuery({ parallelIdSelectStatement, moduleIds })
		query(q).then((parallelTextResult: ClickhouseResponse<ParallelTextQueryResult>) => {
			resolve({
				data: parallelTextResult.data
			})
		}).catch(reject)
	})
export { get }