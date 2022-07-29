const toNormalizedKVPairs = (obj: any) =>
	Object.keys(obj).map(k => ({ key: k, value: obj[k].normalize("NFC") }))
const featureToWhere = ({ key, value }: { key: string; value: string }) =>
	`${key}='${value}'`
const searchTermToGroupArrayFilter = (t: SearchTerm, i: number) =>
	`groupArray(wid) FILTER (WHERE ${toNormalizedKVPairs(t.data).map(featureToWhere).join(" AND ")}) as w${i}`

type Params = {
	searchTerms: SearchTerm[]
	parallelIdQuery: string
	versificationSchemaId: number
	moduleIds: number[]
}
const getHighlightQuery = ({
	searchTerms,
	parallelIdQuery,
	moduleIds
}: Params) => {
	return `
		SELECT
			module_id,
			${searchTerms.map(searchTermToGroupArrayFilter).join(",\n\t\t\t")}
		FROM
			word_features
		WHERE
			word_features.module_id IN (${moduleIds})
			AND word_features.parallel_id IN (${parallelIdQuery})
		GROUP BY
			module_id
	`
}
export { getHighlightQuery }