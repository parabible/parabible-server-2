import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { get as getModule } from "./module.ts"

Deno.test("Module Route", async (t) => {
	await t.step({
		name: "should return a list of modules",
		fn: async () => {
			const { data: modules } = await getModule()
			assertEquals(modules.length > 0, true)
			assertEquals(!!modules.find(m => m.abbreviation === "ETCBC BHSA"), true)
		}
	})
})
