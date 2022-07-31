import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { getVersificationSchemaIdFromModuleId } from "../helpers/moduleInfo.ts"
import { get as getTermSearch } from "./termSearch.ts"

// This just forces the tests to wait until we can actually resolve module ids etc.
const wait10ms = () => new Promise((resolve, _) => setTimeout(resolve, 10))
while (true) {
	if (getVersificationSchemaIdFromModuleId(1) >= 0)
		break
	await wait10ms()
}

Deno.test("should return results from BHSA", async () => {
	const { count } = await getTermSearch({
		searchTerms: [{ uid: "1", invert: false, data: { lexeme: "אמר" } }],
		treeNodeType: "clause",
		modules: "ETCBC BHSA,ccat LXX,Nestle1904",
		corpusFilter: "",
		pageNumber: 0,
		pageSize: 10
	})
	assertEquals(count, 5373)
})

Deno.test("should normalize unicode characters", async () => {
	const { count } = await getTermSearch({
		searchTerms: [{ uid: "1", invert: false, data: { lexeme: "נפשׁ" } }],
		treeNodeType: "clause",
		modules: "ETCBC BHSA,ccat LXX,Nestle1904",
		corpusFilter: "",
		pageNumber: 0,
		pageSize: 10
	})
	assertEquals(count, 3)
})

Deno.test("should work with inverted rules", async () => {
	const { count } = await getTermSearch({
		searchTerms: [
			{ uid: "1", invert: false, data: { lexeme: "נפשׁ" } },
			{ uid: "2", invert: true, data: { lexeme: "נוח" } },
		],
		treeNodeType: "parallel",
		modules: "ETCBC BHSA,ccat LXX,Nestle1904",
		corpusFilter: "",
		pageNumber: 0,
		pageSize: 10
	})
	assertEquals(count, 2)
})

Deno.test("should work with inverted rules", async () => {
	const { count } = await getTermSearch({
		searchTerms: [
			{ uid: "1", invert: false, data: { lexeme: "נפשׁ" } },
			{ uid: "2", invert: true, data: { lexeme: "נוח" } },
		],
		treeNodeType: "parallel",
		modules: "ETCBC BHSA,ccat LXX,Nestle1904",
		corpusFilter: "",
		pageNumber: 0,
		pageSize: 10
	})
	assertEquals(count, 2)
})

Deno.test("should find results across versions (e.g. אֱלֹהִים translated θεός)", async () => {
	const { count } = await getTermSearch({
		searchTerms: [
			{ uid: "1", invert: false, data: { lexeme: "אֱלֹהִים" } },
			{ uid: "2", invert: false, data: { lexeme: "θεός" } },
		],
		treeNodeType: "parallel",
		modules: "net",
		corpusFilter: "",
		pageNumber: 0,
		pageSize: 10
	})
	assertEquals(count > 0, true)
})



// TODO: it("should return the right number of words from Nestle1904", async () => {
// TODO: it("should return the right number of words from LXX", async () => {
// TODO: it("should return the right number of words from combined", async () => {

