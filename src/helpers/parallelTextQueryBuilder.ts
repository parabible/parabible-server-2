type ParamsWithSelectStatement = {
	moduleIds: number[]
	parallelIdQuery: string
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
			parallel_id parallelId,
			module_id moduleId,
			rid,
			text
		FROM
			parallel
		WHERE
			module_id IN (${moduleIds})
			AND parallel_id IN (${"parallelIds" in params ? params.parallelIds : params.parallelIdQuery})
	`
}
export { getTextQuery }