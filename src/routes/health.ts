import { getVersificationSchemaIdFromPrimaryModule } from "../helpers/moduleInfo.ts"

const get = () => {
	const schemaId = getVersificationSchemaIdFromPrimaryModule(1)
	return schemaId === -1
		? {
			response: { error: false }
		}
		: {
			response: {
				error: true,
				code: "DATABASE_ERROR",
				message: "Could not connect to database"
			},
			status: 503
		}
}
export { get }