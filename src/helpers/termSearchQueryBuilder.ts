const PARALLEL_TREE_NODE = "parallel"
const mapTreeNodeTypes = {
	"phrase": "phrase_node_id",
	"clause": "clause_node_id",
	"sentence": "sentence_node_id",
	"verse": "rid",
	"parallel": "parallel_id",
}
const treeNode = (tnt: keyof typeof mapTreeNodeTypes) =>
	tnt in mapTreeNodeTypes
		? mapTreeNodeTypes[tnt]
		: "parallel_id"

const toNormalizedKVPairs = (obj: any) =>
	Object.keys(obj).map(k => ({ key: k, value: obj[k].normalize("NFC") }))

const featureToWhere = ({ key, value }: { key: string; value: string }) =>
	`${key}='${value}'`
const searchTermToGroupArrayFilter = (t: SearchTerm, i: number) =>
	`groupArray(word_uid) FILTER (WHERE ${toNormalizedKVPairs(t.data).map(featureToWhere).join(" AND ")}) as w${i}`

const searchTermToHavingLength = (t: SearchTerm, i: number) =>
	t.invert
		? `length(w${i}) = 0`
		: `length(w${i}) > 0`

const searchTermToSetCoverWs = (searchTerms: SearchTerm[]) => {
	const ret: string[] = []
	searchTerms.forEach((s: SearchTerm, i: number) => {
		if (!s.invert) {
			ret.push(`w${i}`)
		}
	})
	return ret.join(", ")
}

type Params = {
	searchTerms: SearchTerm[]
	treeNodeType:
	| "phrase"
	| "clause"
	| "sentence"
	| "verse"
	| "parallel"
	moduleIds: number[]
	parallelIdQuery: string
	versificationSchemaId: number
	pageNumber: number
	pageSize: number
}
const getTermSearchQuery = ({
	searchTerms,
	treeNodeType,
	parallelIdQuery,
	moduleIds,
	versificationSchemaId,
	pageNumber,
	pageSize,
}: Params) => {
	// TODO: Benchmark against having the `parallel_id IN` condition inside and outside the VIEW
	return `
		SELECT 
			*
		FROM VIEW(
			SELECT
				${treeNodeType !== PARALLEL_TREE_NODE ? "module_id," : ""}
				min(parallel_id) lowest_parallel_id,
				groupUniqArray(parallel_id) parallel_id_set,
				${treeNode(treeNodeType)} tree_node,
				${searchTerms.map(searchTermToGroupArrayFilter).join(",\n\t\t\t")}
			FROM
				word_features
			GROUP BY
				${treeNodeType !== PARALLEL_TREE_NODE ? "module_id," : ""}
				${treeNode(treeNodeType)}
			HAVING
				${treeNode(treeNodeType)} > 0
				AND ${searchTerms.map(searchTermToHavingLength).join("\n\t\t\tAND ")}
				AND parallel_id IN (${parallelIdQuery})) t
		LEFT JOIN ordering_index
			ON ordering_index.parallel_id = t.lowest_parallel_id
		WHERE set_cover_possible([${searchTermToSetCoverWs(searchTerms)}]) = 1
			AND versification_schema_id = ${versificationSchemaId}
		ORDER BY ordering_index.order_in_schema
		LIMIT ${pageSize}
		OFFSET ${pageNumber * pageSize}`
}
export { getTermSearchQuery }
