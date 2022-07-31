import { generateRid, parse } from "./reference.ts"
import { getVersificationSchemaIdFromModuleId, getNameFromVersificationId } from "./moduleInfo.ts"

const verseToCondition = (reference: Reference) => reference.verse
	? `rid = ${generateRid(reference)}`
	: reference.chapter
		? `intDiv(rid, 1000) = ${generateRid(reference) / 1000}`
		: `intDiv(rid, 1000000) = ${generateRid(reference) / 1000000}`

const requireBothWithVerseOrBothWithout = (startingReference: Reference, endingReference: Reference) => {
	if (startingReference.verse && endingReference.verse || !startingReference.verse && !endingReference.verse) {
		return true
	}
	else {
		throw (new Error("Either both starting and ending reference must have a verse or neither must have a verse"))
	}
}
const requireBothWithChapterOrBothWithout = (startingReference: Reference, endingReference: Reference) => {
	if (startingReference.chapter && endingReference.chapter || !startingReference.chapter && !endingReference.chapter) {
		return true
	}
	else {
		throw (new Error("Either both starting and ending reference must have a verse or neither must have a verse"))
	}
}
const rangeToCondition = (startingReference: Reference, endingReference: Reference) => {
	requireBothWithVerseOrBothWithout(startingReference, endingReference)
	requireBothWithChapterOrBothWithout(endingReference, startingReference)
	return startingReference.verse
		? `(rid >= ${generateRid(startingReference)} AND rid <= ${generateRid(endingReference)})`
		: startingReference.chapter
			? `(rid >= ${generateRid(startingReference)} AND rid <= ${generateRid(endingReference) + 999})`
			: `(rid >= ${generateRid(startingReference)} AND rid <= ${generateRid(endingReference) + 999999})`
}



const hasWhatLooksLikeACorpus = (corpusPartial: string) => /[a-zA-Z]/g.test(corpusPartial)
const hasWhatLooksLikeAChapterVerseDivision = (corpusPartial: string) => /\d\b.*\d/g.test(corpusPartial)

const corpusToChapterAndVerse = (corpus: string) => {
	const chv = corpus.match(/\d+/g)
	if (!chv || chv.length !== 2) {
		throw new Error("Expected chapter and verse but got: " + corpus)
	}
	const [chapter, verse] = chv
	return {
		chapter: +chapter,
		verse: +verse,
	}
}
const corpusToNumber = (corpus: string) => +(corpus.match(/\d+/)?.[0] || -1)

const parseCorpusWithoutCorpus = (corpusPartial: string, { previousBook, previousChapter, previousVerse }: { previousBook: string, previousChapter: number, previousVerse: number | false }) => {
	const book = previousBook
	const { chapter, verse } = hasWhatLooksLikeAChapterVerseDivision(corpusPartial)
		? corpusToChapterAndVerse(corpusPartial)
		: previousVerse
			? { chapter: previousChapter, verse: corpusToNumber(corpusPartial) }
			: { chapter: corpusToNumber(corpusPartial), verse: null }

	return { book, chapter, verse }
}

const parseCorpusPartial = (corpusPartial: string, { previousBook, previousChapter, previousVerse }: { previousBook: string, previousChapter: number, previousVerse: number | false }) =>
	hasWhatLooksLikeACorpus(corpusPartial)
		? parse(corpusPartial)
		: parseCorpusWithoutCorpus(corpusPartial, { previousBook, previousChapter, previousVerse })

const distinct = <T>(...arr: any[]) => Array.from(new Set<T>(...arr))

type CorpusCollection = "OT" | "NT"
const vSchemaCorpusCoverage: {
	[schemaName: string]: CorpusCollection[]
} = {
	"kjv": ["OT", "NT"],
	"bhs": ["OT"],
	"gnt": ["NT"],
	"lxx": ["OT"],
}
// Corpora Constraints
// OT: 0 - 39_999_999
// NT: 40_000_000 - 66_999_999
const constraints = {
	"OT": [0, 39_999_999],
	"NT": [40_000_000, 66_999_999]
}
const moduleIdsToVersificationSchemaConstraints = (moduleIds: number[]) => {
	const schemas = moduleIds
		.map(getVersificationSchemaIdFromModuleId)
		.map(getNameFromVersificationId)

	const corporaCoverage = distinct<CorpusCollection>(schemas.map(s => vSchemaCorpusCoverage[s]).flat())

	const moduleIdByCorpus = Object.fromEntries(corporaCoverage.map(corpusCollection => [
		corpusCollection,
		// Get the first moduleId that matches each corpus range
		moduleIds.find((_, i) => vSchemaCorpusCoverage[schemas[i]].includes(corpusCollection)) || -1
	]))

	if (distinct(Object.values(moduleIdByCorpus)).length === 1) {
		return `versification_schema_id = ${getVersificationSchemaIdFromModuleId(Object.values(moduleIdByCorpus)[0])}`
	}
	else {
		return "(" + corporaCoverage.map(c => {
			const [minRid, maxRid] = constraints[c]
			return `
				(versification_schema_id = ${getVersificationSchemaIdFromModuleId(moduleIdByCorpus[c])}
				AND rid > ${minRid} AND rid < ${maxRid})`
		}).join("\n\t\t\t\tOR\n") + ")"
	}
}


type Params = {
	// versificationSchemaId: number,
	moduleIds: number[],
	corpusFilter: string,
}
const generateParallelIdQueryFromCorpora = ({ moduleIds, corpusFilter }: Params) => {
	const corpora = corpusFilter.split(",")
	const corporaRanges = corpora.map(corpus => corpus.split(/[-–—]/))
	const corporaConditions: string[] = []

	let previousBook: string
	let previousChapter: number
	let previousVerse: number | false = false
	corporaRanges.forEach(corpusPartial => {
		const ref: Reference = parseCorpusPartial(corpusPartial[0], { previousBook, previousChapter, previousVerse })
		if (corpusPartial.length === 1) {
			previousBook = ref.book
			previousChapter = ref.chapter
			previousVerse = ref.verse
			corporaConditions.push(verseToCondition(ref))
		}
		else {
			// it is a range
			const endingRef = parseCorpusPartial(corpusPartial[1], {
				previousBook: ref.book,
				previousChapter: ref.chapter,
				previousVerse: ref.verse
			})
			corporaConditions.push(rangeToCondition(ref, endingRef))
		}
	})

	return `
		SELECT
			parallel_id
		FROM
			parallel
		WHERE
			${moduleIdsToVersificationSchemaConstraints(moduleIds)}
			${corpusFilter.length > 0 ? `AND (${corporaConditions.join(" OR ")})` : ""}
	`
}

export { generateParallelIdQueryFromCorpora }