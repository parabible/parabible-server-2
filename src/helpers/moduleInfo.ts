import { query } from "../database/connection.ts"

type ModuleInfoResult = {
	abbreviation: string
	module_id: number
	versification_schema_id: number
	versification_schema: string
}[]
let moduleAbbreviationToModuleId: {
	[key: string]: number
} = {}
let moduleIdToVersificationId: {
	[key: number]: number
} = {}
let versificationIdToName: {
	[key: number]: string
} = {}

const populate = () => {
	query(`SELECT abbreviation, versification_schema, versification_schema_id, module_id FROM module_info`).then((response: ClickhouseResponse<ModuleInfoResult>) => {
		moduleAbbreviationToModuleId = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.abbreviation.toLowerCase(),
			moduleInfo.module_id
		]))
		moduleIdToVersificationId = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.module_id,
			moduleInfo.versification_schema_id
		]))
		versificationIdToName = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.versification_schema_id,
			moduleInfo.versification_schema
		]))
	}).catch(_ => {
		setTimeout(populate, 1 * 1000)
	})
}
populate()

const getVersificationSchemaIdFromModuleId = (moduleId: number) =>
	moduleId in moduleIdToVersificationId ? moduleIdToVersificationId[moduleId] : -1

const getNameFromVersificationId = (id: number) =>
	id in versificationIdToName ? versificationIdToName[id] : ""

const getModuleIdsFromModules = (moduleString: string) => {
	if (!moduleString.length) {
		return []
	}
	return moduleString
		.split(",")
		.map(m => m.trim().toLowerCase())
		.map(m => m in moduleAbbreviationToModuleId ? moduleAbbreviationToModuleId[m] : -1)
		.filter(i => i != -1)
}
export {
	getVersificationSchemaIdFromModuleId,
	getNameFromVersificationId,
	getModuleIdsFromModules,
}