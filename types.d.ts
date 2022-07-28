type SearchTerm = {
	uid: string
	invert: boolean
	data: {
		[key: string]: string
	}
}

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
type ModuleQueryResponse = {
	abbreviation: string
	module_id: number
}[]
type WordQueryResponse = {
	wid: number
	module_id: number
}[]
type ParallelTextQueryResponse = {
	parallel_id: number
	module_id: number
	rid: number
	text: string
}[]
type TermSearchQueryResponse = {
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
type HighlightQueryResponse = ModuleHighlights[]