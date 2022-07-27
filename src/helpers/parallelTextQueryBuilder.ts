type Params = {
    parallelIds: number[],
    moduleIds: number[]
}
const getTextQuery = ({
    parallelIds,
    moduleIds
}: Params) => {
    return `
        SELECT
            parallel_id,
            module_id,
            rid,
            text
        FROM
            parallel
        WHERE
            parallel_id IN (${parallelIds})
            AND module_id IN (${moduleIds})
    `
}
export { getTextQuery }