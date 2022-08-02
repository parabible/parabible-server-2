import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { getVersificationSchemaIdFromModuleId } from "../helpers/moduleInfo.ts"
import { get as getText } from "./text.ts"

// This just forces the tests to wait until we can actually resolve module ids etc.
const wait10ms = () => new Promise((resolve, _) => setTimeout(resolve, 10))
while (true) {
	if (getVersificationSchemaIdFromModuleId(1) >= 0)
		break
	await wait10ms()
}

Deno.test("should return Gen 1:1 in Hebrew", async () => {
	const gen1v1 = await getText({
		modules: "etcbc bhsa",
		reference: "gen 1:1"
	})
	assertEquals(gen1v1, {
		"matchingText": [
			{
				"module_id": 7,
				"parallel_id": 1,
				"rid": 1001001,
				"text": "[{\"wid\":1,\"text\":\"בְּ\",\"trailer\":\"\"},{\"wid\":2,\"text\":\"רֵאשִׁ֖ית\",\"trailer\":\" \"},{\"wid\":3,\"text\":\"בָּרָ֣א\",\"trailer\":\" \"},{\"wid\":4,\"text\":\"אֱלֹהִ֑ים\",\"trailer\":\" \"},{\"wid\":5,\"text\":\"אֵ֥ת\",\"trailer\":\" \"},{\"wid\":6,\"text\":\"הַ\",\"trailer\":\"\"},{\"wid\":7,\"text\":\"שָּׁמַ֖יִם\",\"trailer\":\" \"},{\"wid\":8,\"text\":\"וְ\",\"trailer\":\"\"},{\"wid\":9,\"text\":\"אֵ֥ת\",\"trailer\":\" \"},{\"wid\":10,\"text\":\"הָ\",\"trailer\":\"\"},{\"wid\":11,\"text\":\"אָֽרֶץ\",\"trailer\":\"׃ \"}]"
			}
		],
		"order": [1]
	})
})

Deno.test("should return verses across corpora", async () => {
	const gen1v1 = await getText({
		modules: "etcbc bhsa,net",
		reference: "mal3:24-mat1:1"
	})
	// right now it's failing because of versification schemas (bhs doesn't have mt3)
	assertEquals(gen1v1, {
		"matchingText": [
			{
				"module_id": 4,
				"parallel_id": 23145,
				"rid": 39004006,
				"text": "He will encourage fathers and their children to return to me, so that I will not come and strike the earth with judgment.”"
			},
			{
				"module_id": 4,
				"parallel_id": 23146,
				"rid": 40001001,
				"text": "This is the record of the genealogy of Jesus Christ, the son of David, the son of Abraham."
			},
			{
				"module_id": 7,
				"parallel_id": 23145,
				"rid": 39003024,
				"text": "[{\"wid\":310634,\"text\":\"וְ\",\"trailer\":\"\"},{\"wid\":310635,\"text\":\"הֵשִׁ֤יב\",\"trailer\":\" \"},{\"wid\":310636,\"text\":\"לֵב\",\"trailer\":\"־\"},{\"wid\":310637,\"text\":\"אָבֹות֙\",\"trailer\":\" \"},{\"wid\":310638,\"text\":\"עַל\",\"trailer\":\"־\"},{\"wid\":310639,\"text\":\"בָּנִ֔ים\",\"trailer\":\" \"},{\"wid\":310640,\"text\":\"וְ\",\"trailer\":\"\"},{\"wid\":310641,\"text\":\"לֵ֥ב\",\"trailer\":\" \"},{\"wid\":310642,\"text\":\"בָּנִ֖ים\",\"trailer\":\" \"},{\"wid\":310643,\"text\":\"עַל\",\"trailer\":\"־\"},{\"wid\":310644,\"text\":\"אֲבֹותָ֑ם\",\"trailer\":\" \"},{\"wid\":310645,\"text\":\"פֶּן\",\"trailer\":\"־\"},{\"wid\":310646,\"text\":\"אָבֹ֕וא\",\"trailer\":\" \"},{\"wid\":310647,\"text\":\"וְ\",\"trailer\":\"\"},{\"wid\":310648,\"text\":\"הִכֵּיתִ֥י\",\"trailer\":\" \"},{\"wid\":310649,\"text\":\"אֶת\",\"trailer\":\"־\"},{\"wid\":310650,\"text\":\"הָ\",\"trailer\":\"\"},{\"wid\":310651,\"text\":\"אָ֖רֶץ\",\"trailer\":\" \"},{\"wid\":310652,\"text\":\"חֵֽרֶם\",\"trailer\":\"׃ \"}]"
			}
		],
		"order": [
			23145,
			23146
		]
	})
})