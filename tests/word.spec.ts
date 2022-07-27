import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { get as getWord } from "../src/routes/word.ts"

Deno.test("Word Route", async (t) => {
	await t.step({
		name: "should return expected word data from the Nestle1904",
		fn: async () => {
			const w = await getWord({
				moduleId: 5,
				wid: 120
			})
			const lexeme = w.data.find(kv => kv.key === "lexeme")?.value
			assertEquals(lexeme, "ἰωσαφάτ")
		}
	})

	await t.step({
		name: "should return expected word data from BHSA",
		fn: async () => {
			const w = await getWord({
				moduleId: 7,
				wid: 1
			})
			const lexeme = w.data.find(kv => kv.key === "lexeme")?.value
			assertEquals(lexeme, "בְּ")
		}
	})

	await t.step({
		name: "should produce an error when the word does not exist",
		fn: async () => {
			try {
				const w = await getWord({
					moduleId: -1,
					wid: -1
				})
			}
			catch (e) {
				assertEquals(e.response.error, true)
				assertEquals(e.response.code, "WORD_NOT_FOUND")
				assertEquals(e.status, 400)
				return
			}
			assertEquals(true, false)
		}
	})
})
