import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { get as getWord } from "./word.ts";
import {
  getModuleIdsFromModules,
  getVersificationSchemaIdFromModuleId,
} from "../helpers/moduleInfo.ts";

// This just forces the tests to wait until we can actually resolve module ids etc.
const wait10ms = () => new Promise((resolve, _) => setTimeout(resolve, 10));
while (true) {
  if (getVersificationSchemaIdFromModuleId(1) >= 0) {
    break;
  }
  await wait10ms();
}

Deno.test("should return expected word data from the Nestle1904", async () => {
  const w = await getWord({
    moduleId: getModuleIdsFromModules("NA1904")[0],
    wid: 120,
  });
  const lexeme = w.data.find((kv) => kv.key === "lexeme")?.value;
  assertEquals(lexeme?.toLowerCase(), "ἰωσαφάτ");
});

Deno.test("should return expected word data from BHSA", async () => {
  const w = await getWord({
    moduleId: getModuleIdsFromModules("BHSA")[0],
    wid: 1,
  });
  const lexeme = w.data.find((kv) => kv.key === "lexeme")?.value;
  assertEquals(lexeme, "בְּ");
});

Deno.test("should produce an error when the word does not exist", async () => {
  try {
    const w = await getWord({
      moduleId: -1,
      wid: -1,
    });
  } catch (e) {
    assertEquals(e.response.error, true);
    assertEquals(e.response.code, "WORD_NOT_FOUND");
    assertEquals(e.status, 400);
    return;
  }
  assertEquals(true, false);
});
