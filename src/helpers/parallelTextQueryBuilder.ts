type ParamsWithSelectStatement = {
	moduleIds: number[]
	parallelIdSelectStatement: string
}
type ParamsWithIds = {
	moduleIds: number[]
	parallelIds: number[]
}
type Params = ParamsWithSelectStatement | ParamsWithIds

const getTextQuery = (params: Params) => {
	const { moduleIds } = params

	return `
		SELECT
			parallel_id,
			module_id,
			rid,
			text
		FROM
			parallel
		WHERE
			module_id IN (${moduleIds})
			AND parallel_id IN (${"parallelIds" in params ? params.parallelIds : params.parallelIdSelectStatement})
	`
}
export { getTextQuery }