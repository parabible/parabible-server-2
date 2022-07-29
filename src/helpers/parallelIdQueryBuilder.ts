import { generateRid, parse } from "./reference.ts"

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


type Params = {
	versificationSchemaId: number,
	corpusFilter: string,
}
const generateParallelIdQueryFromCorpora = ({ versificationSchemaId, corpusFilter }: Params) => {
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

	const r = `
		SELECT
			parallel_id
		FROM
			parallel
		WHERE
			versification_schema_id = ${versificationSchemaId}
			AND (${corporaConditions.join(" OR ")})
	`
	console.log(r)
	return r
}

export { generateParallelIdQueryFromCorpora }