import { query } from "../database/connection.ts"

const HEALTH_CHECK_TIMEOUT = 5000

type ModuleInfoResult = {
	abbreviation: string
	moduleId: number
	versificationSchemaId: number
	versificationSchema: string
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
	query(`
		SELECT 
			abbreviation,
			versification_schema versificationSchema,
			versification_schema_id versificationSchemaId,
			module_id moduleId
		FROM
			module_info
	`).then((response: ClickhouseResponse<ModuleInfoResult>) => {
		moduleAbbreviationToModuleId = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.abbreviation.toLowerCase(),
			moduleInfo.moduleId
		]))
		moduleIdToVersificationId = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.moduleId,
			moduleInfo.versificationSchemaId
		]))
		versificationIdToName = Object.fromEntries(response.data.map(moduleInfo => [
			moduleInfo.versificationSchemaId,
			moduleInfo.versificationSchema
		]))
		console.log("Got module info from DB!")
	}).catch(_ => {
		setTimeout(populate, 1 * HEALTH_CHECK_TIMEOUT)
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