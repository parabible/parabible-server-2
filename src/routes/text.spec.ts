import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { getVersificationSchemaIdFromModuleId } from "../helpers/moduleInfo.ts";
import { get as getText } from "./text.ts";

// This just forces the tests to wait until we can actually resolve module ids etc.
const wait10ms = () => new Promise((resolve, _) => setTimeout(resolve, 10));
while (true) {
  if (getVersificationSchemaIdFromModuleId(1) >= 0) {
    break;
  }
  await wait10ms();
}

Deno.test("should return Gen 1:1 in Hebrew", async () => {
  const gen1v1 = await getText({
    modules: "bhsa",
    reference: "gen 1:1",
  });
  assertEquals(gen1v1, {
    "matchingText": [
      {
        "moduleId": gen1v1?.matchingText[0].moduleId, // ModuleId is dynamic, so we can't test it
        "parallelId": 1,
        "rid": 1001001,
        "text":
          '[{"wid":1,"text":"בְּ","trailer":""},{"wid":2,"text":"רֵאשִׁ֖ית","trailer":" "},{"wid":3,"text":"בָּרָ֣א","trailer":" "},{"wid":4,"text":"אֱלֹהִ֑ים","trailer":" "},{"wid":5,"text":"אֵ֥ת","trailer":" "},{"wid":6,"text":"הַ","trailer":""},{"wid":7,"text":"שָּׁמַ֖יִם","trailer":" "},{"wid":8,"text":"וְ","trailer":""},{"wid":9,"text":"אֵ֥ת","trailer":" "},{"wid":10,"text":"הָ","trailer":""},{"wid":11,"text":"אָֽרֶץ","trailer":"׃ "}]',
      },
    ],
    "order": [1],
  });
});

Deno.test("should return verses across corpora", async () => {
  const gen1v1 = await getText({
    modules: "bhsa,net",
    reference: "mal3:24-mat1:1",
  });
  const hasOtResult = !!gen1v1?.matchingText.find((m) => m.rid === 39003024);
  assertEquals(hasOtResult, true);
  const hasNtResult = !!gen1v1?.matchingText.find((m) => m.rid === 40001001);
  assertEquals(hasNtResult, true);
});
