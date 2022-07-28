import { query } from "../database/connection.ts"
import { getTextQuery } from "../helpers/highlightQueryBuilder.ts"
import { getIdFromSchema } from "../helpers/versificationSchemas.ts"

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
    moduleIds: number[]
    ridForChapter: number
    versificationSchema: string
}
const get = ({ searchTerms, ridForChapter, moduleIds, versificationSchema }: Params) =>
    new Promise<HighlightResponse>((resolve, reject) => {
        const versificationSchemaId = getIdFromSchema(versificationSchema)
        const q = getTextQuery({ searchTerms, ridForChapter, moduleIds, versificationSchemaId })
        query(q).then((highlights: ClickhouseResponse<HighlightQueryResponse>) => {
            resolve({
                data: highlights.data.map(moduleHighlightsToArrayOfArrays(searchTerms)).flat(2)
            })
        }).catch(reject)
    })
export { get }