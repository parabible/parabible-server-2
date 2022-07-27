import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { get as getTermSearch } from "./termSearch.ts"

Deno.test("Term Search Route", async (t) => {
	await t.step({
		name: "should return the right number of words from BHSA",
		fn: async () => {
			const { count } = await getTermSearch({
				searchTerms: [{ invert: false, data: { lexeme: "אמר" } }],
				treeNodeType: "clause",
				modules: "ETCBC+BHSA,LXX,Nestle1904",
				corpusFilter: "",
				versificationSchema: "kjv",
			})
			assertEquals(count, 5373)
		}
	})

	await t.step({
		name: "should normalize unicode characters",
		fn: async () => {
			const { count } = await getTermSearch({
				searchTerms: [{ invert: false, data: { lexeme: "נפשׁ" } }],
				treeNodeType: "clause",
				modules: "ETCBC+BHSA,LXX,Nestle1904",
				corpusFilter: "",
				versificationSchema: "kjv",
			})
			assertEquals(count, 3)
		}
	})

	await t.step({
		name: "should work with inverted rules",
		fn: async () => {
			const { count } = await getTermSearch({
				searchTerms: [
					{ invert: false, data: { lexeme: "נפשׁ" } },
					{ invert: true, data: { lexeme: "נוח" } },
				],
				treeNodeType: "parallel",
				modules: "ETCBC+BHSA,LXX,Nestle1904",
				corpusFilter: "",
				versificationSchema: "kjv",
			})
			assertEquals(count, 2)
		}
	})
})


// TODO: it("should return the right number of words from Nestle1904", async () => {
// TODO: it("should return the right number of words from LXX", async () => {
// TODO: it("should return the right number of words from combined", async () => {

