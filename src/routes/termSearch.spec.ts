import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {
  getModuleIdsFromModules,
  getVersificationSchemaIdFromModuleId,
} from "../helpers/moduleInfo.ts";
import { get as getTermSearch } from "./termSearch.ts";

// This just forces the tests to wait until we can actually resolve module ids etc.
const wait10ms = () => new Promise((resolve, _) => setTimeout(resolve, 10));
while (true) {
  if (getVersificationSchemaIdFromModuleId(1) >= 0) {
    break;
  }
  await wait10ms();
}

Deno.test("should return results from BHSA", async () => {
  const results = await getTermSearch({
    searchTerms: [{ uid: "1", inverted: false, data: { lexeme: "אמר" } }],
    treeNodeType: "clause",
    moduleIds: getModuleIdsFromModules("BHSA,NA1904"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(results.count, 5373);
  assertEquals("warmWords" in results, true);
  assertEquals("orderedResults" in results, true);
  assertEquals(results.orderedResults.length, 10);
});

Deno.test("should normalize unicode characters", async () => {
  const { count } = await getTermSearch({
    searchTerms: [{ uid: "1", inverted: false, data: { lexeme: "נפשׁ" } }],
    treeNodeType: "clause",
    moduleIds: getModuleIdsFromModules("BHSA,NA1904"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(count, 3);
});

Deno.test("should work with inverted rules", async () => {
  const { count } = await getTermSearch({
    searchTerms: [
      { uid: "1", inverted: false, data: { lexeme: "נפשׁ" } },
      { uid: "2", inverted: true, data: { lexeme: "נוח" } },
    ],
    treeNodeType: "parallel",
    moduleIds: getModuleIdsFromModules("BHSA,NA1904"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(count, 2);
});

Deno.test("should work with inverted rules", async () => {
  const { count } = await getTermSearch({
    searchTerms: [
      { uid: "1", inverted: false, data: { lexeme: "נפשׁ" } },
      { uid: "2", inverted: true, data: { lexeme: "נוח" } },
    ],
    treeNodeType: "parallel",
    moduleIds: getModuleIdsFromModules("BHSA,NA1904"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(count, 2);
});

Deno.test("should find results across versions (e.g. אֱלֹהִים translated θεός)", async () => {
  const { count } = await getTermSearch({
    searchTerms: [
      { uid: "1", inverted: false, data: { lexeme: "אֱלֹהִים" } },
      { uid: "2", inverted: false, data: { lexeme: "θεός" } },
    ],
    treeNodeType: "parallel",
    moduleIds: getModuleIdsFromModules("net"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(count > 0, true);
});

Deno.test("should find NT result when first version listed does not include NT (can search across versions)", async () => {
  const { count } = await getTermSearch({
    searchTerms: [
      { uid: "1", inverted: false, data: { lexeme: "λόγος" } },
    ],
    treeNodeType: "parallel",
    moduleIds: getModuleIdsFromModules("bhsa,NA1904"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(count > 0, true);
});

Deno.test("should not find LXX results when searching the NT", async () => {
  const r = await getTermSearch({
    searchTerms: [
      { uid: "1", inverted: false, data: { lexeme: "λόγος" } },
    ],
    treeNodeType: "parallel",
    moduleIds: getModuleIdsFromModules("NA1904"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  assertEquals(r.count === 0, true);
});

Deno.test("should find LXX results", async () => {
  const r = await getTermSearch({
    searchTerms: [
      { uid: "1", inverted: false, data: { lexeme: "λόγος" } },
    ],
    treeNodeType: "parallel",
    moduleIds: getModuleIdsFromModules("LXXR"),
    parallelIdQuery: "",
    page: 0,
    pageSize: 10,
  });
  console.log(r);
  assertEquals(r.count > 0, true);
});

// TOOD: should handle corpus filters (parallelIdQuery)
// TODO: it("should return the right number of words from NA1904", async () => {
// TODO: it("should return the right number of words from LXX", async () => {
// TODO: it("should return the right number of words from combined", async () => {
