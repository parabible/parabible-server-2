type Params = {
	parallelIdQuery: string
	versificationSchemaId: number
}
const getParallelOrdering = ({
	parallelIdQuery,
	versificationSchemaId
}: Params) => {
	return `
	SELECT
		DISTINCT(parallel_id) parallelId
	FROM
		parallel
	LEFT JOIN ordering_index
		ON ordering_index.parallel_id = parallel.parallel_id
		AND ordering_index.versification_schema_id = ${versificationSchemaId}
	WHERE
		parallel_id IN (${parallelIdQuery})
	ORDER BY order_in_schema
	`
}
export { getParallelOrdering }
