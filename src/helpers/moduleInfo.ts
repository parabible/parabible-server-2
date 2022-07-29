import { query } from "../database/connection.ts"

type ModuleInfoResult = {
	abbreviation: string
	module_id: number
	versification_schema_id: number
}[]
let moduleAbbreviationToModuleId: {
	[key: string]: number
} = {}
let moduleIdToVersificationId: {
	[key: number]: number
} = {}

const populate = () => {
	query(`SELECT abbreviation, versification_schema_id, module_id FROM module_info`).then((response: ClickhouseResponse<ModuleInfoResult>) => {
		moduleAbbreviationToModuleId = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.abbreviation.toLowerCase(),
			moduleInfo.module_id
		]))
		moduleIdToVersificationId = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.module_id,
			moduleInfo.versification_schema_id
		]))
	}).catch(_ => {
		setTimeout(populate, 1 * 1000)
	})
}
populate()

const getVersificationSchemaIdFromPrimaryModule = (moduleId: number) => {
	if (Object.keys(moduleIdToVersificationId).length > 0) {
		return moduleId in moduleIdToVersificationId ? moduleIdToVersificationId[moduleId] : -1
	}
	return -1
}
const getModuleIdsFromModules = (moduleString: string) => {
	if (!moduleString.length) {
		return [1]
	}
	return moduleString
		.split(",")
		.map(m => m.trim())
		.map(m => m in moduleAbbreviationToModuleId ? moduleAbbreviationToModuleId[m] : -1)
		.filter(i => i != -1)
}
export { getVersificationSchemaIdFromPrimaryModule, getModuleIdsFromModules }