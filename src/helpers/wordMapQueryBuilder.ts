type Params = {
	wordUids: number[]
}
const getWordQuery = ({
	wordUids
}: Params) => {
	return `
		SELECT
			wid,
			module_id moduleId
		FROM
			word_features
		WHERE
			word_uid IN (${wordUids})
	`
}
export { getWordQuery }