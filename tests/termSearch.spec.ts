import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { get as getTermSearch } from "../src/routes/termSearch.ts"

Deno.test("Term Search Route", async (t) => {
    await t.step({
        name: "should return the right number of words from BHSA",
        fn: async () => {
            const { count } = await getTermSearch({
                searchTerms: [{ invert: false, data: { lexeme: "אמר" } }],
                treeNodeType: "clause",
                modules: "ETCBC+BHSA,LXX,Nestle1904",
                corpusFilter: "",
                versificationSchema: "kjv"
            })
            assertEquals(count, 5373)
        }
    })
})


// TODO: it("should return the right number of words from Nestle1904", async () => {
// TODO: it("should return the right number of words from LXX", async () => {
// TODO: it("should return the right number of words from combined", async () => {

