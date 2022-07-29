type Reference = {
	book: string
	chapter: number
	verse: number | false
}
type SearchTerm = {
	uid: string
	invert: boolean
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
		module_id: number
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
		parallel_id: number
		module_id: number
		rid: number
		text: string
	}[],
	matchingWords: {
		wid: number
		module_id: number
	}[]
}
type HighlightResponse = {
	data: {
		uid: string
		module_id: number
		wid: number
	}[]
}
type TextResponse = {
	data: ParallelTextQueryResult
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
	module_id: number
}[]
type WordQueryResult = {
	wid: number
	module_id: number
}[]
type ParallelTextQueryResult = {
	parallel_id: number
	module_id: number
	rid: number
	text: string
}[]
type TermSearchQueryResult = {
	module_id: number
	lowest_parallel_id: number
	parallel_id_set: number[]
	tree_node: number
	[word: `w${number}`]: number[]
}[]
type ModuleHighlights = {
	module_id: number
	[word: `w${number}`]: number[]
}
type HighlightQueryResult = ModuleHighlights[]
