type Reference = {
	book: string
	chapter: number
	verse: number | false
}
type SearchTerm = {
	uid: string
	inverted: boolean
	data: {
		[key: string]: string
	}
}

// The problem with this is that not everything is an array...
// type Response<T> = {
// 	data: T[]
// }
type ModuleResponse = {
	data: {
		abbreviation: string
		moduleId: number
	}[]
}
type WordResponse = {
	data: {
		key: string
		value: string
	}[]
}
type TermSearchResponse = {
	count: number
	orderedResults: number[][]
	matchingText: {
		parallelId: number
		moduleId: number
		rid: number
		text: string
	}[],
	matchingWords: {
		wid: number
		moduleId: number
	}[]
	warmWords: {
		wids: number[]
		moduleId: number
	}[]
}
type HighlightResponse = {
	data: {
		uid: string
		moduleId: number
		wid: number
	}[]
}
type TextResponse = {
	matchingText: ParallelTextQueryResult,
	order: number[]
}

type ClickhouseResponse<T> = {
	data: T
	meta: [{ name: string, type: string }]
	rows: number
	rows_before_limit_at_least?: number
	statistics: {
		"bytes_read": number,
		"elapsed": number,
		"rows_read": number
	}
}
type ModuleQueryResult = {
	abbreviation: string
	moduleId: number
}[]
type WordQueryResult = {
	wid: number
	moduleId: number
}[]
type ParallelOrderingResult = {
	parallelId: number
}[]
type ParallelTextQueryResult = {
	parallelId: number
	moduleId: number
	rid: number
	text: string
}[]
type TermSearchQueryResult = {
	moduleId?: number
	lowestParallelId: number
	parallelIdSet: number[]
	treeNode: number
	warmWids?: number[]
	[word: `w${number}`]: number[]
}[]
type ModuleHighlights = {
	moduleId: number
	[word: `w${number}`]: number[]
}
type HighlightQueryResult = ModuleHighlights[]
