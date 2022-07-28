import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { get as getTermSearch } from "./termSearch.ts"

Deno.test("should return results from BHSA", async () => {
	const { count } = await getTermSearch({
		searchTerms: [{ invert: false, data: { lexeme: "אמר" } }],
		treeNodeType: "clause",
		modules: "ETCBC+BHSA,LXX,Nestle1904",
		corpusFilter: "",
		versificationSchema: "kjv",
	})
	assertEquals(count, 5373)
})

Deno.test("should normalize unicode characters", async () => {
	const { count } = await getTermSearch({
		searchTerms: [{ invert: false, data: { lexeme: "נפשׁ" } }],
		treeNodeType: "clause",
		modules: "ETCBC+BHSA,LXX,Nestle1904",
		corpusFilter: "",
		versificationSchema: "kjv",
	})
	assertEquals(count, 3)
})

Deno.test("should work with inverted rules", async () => {
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
})


// TODO: it("should return the right number of words from Nestle1904", async () => {
// TODO: it("should return the right number of words from LXX", async () => {
// TODO: it("should return the right number of words from combined", async () => {

