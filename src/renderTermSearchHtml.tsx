/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, renderToString } from "https://deno.land/x/jsx/mod.ts"

import { tw, apply, setup } from 'https://cdn.skypack.dev/twind'
import { virtualSheet, getStyleTag } from 'https://cdn.skypack.dev/twind/sheets'

import { getModuleIdsFromModules } from "./helpers/moduleInfo.ts"
import { generateReference } from "./helpers/reference.ts"


const sheet = virtualSheet()
setup({ sheet })

type Word = {
	wid: number
	leader?: string
	text: string
	trailer: string
}
const wordArrayToHtml = (wordArray: Word[]) =>
	wordArray.map(w => (w.leader || "") + `<a href="#${w.wid}">` + w.text + `</a>` + w.trailer).join("")

const textToView = (text: string) => {
	try {
		const wordArray = JSON.parse(text)
		return <span class={tw`table-cell`} dangerouslySetInnerHTML={{ __html: wordArrayToHtml(wordArray)}} />
	}
	catch (_JSON_PARSE_ERROR) {
		// It's html
		return <span class={tw`table-cell`} dangerouslySetInnerHTML={{ __html: text}} />
	}
}

const getUrlForPage = (url: URL, page: number) => {
	const newUrl = new URLSearchParams(url.searchParams)
	newUrl.set("page", String(page))
	return url.pathname + "?" + newUrl.toString()
}

const renderBody = async (results: TermSearchResponse, page: number, pageSize: number, url: URL) => {
	const moduleIds = getModuleIdsFromModules(url.searchParams.get("modules") || "")
	const paginationStyles = apply`flex flex-row`
	const paginationButtonStyles = apply`flex-0 m-1 px-2 py-1 rounded-sm bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-800 font-bold`
	const paginationDisabledButtonStyles = apply`flex-0 m-1 px-2 py-1 rounded-sm bg-gray-200 text-gray-500 font-bold`

	return await renderToString(
		<>
			<h1 class={tw`flex flex-col items-center`}>{page + 1}/{Math.ceil(results.count / pageSize)} ({results.count} results)</h1>
			<div class={tw`flex flex-col items-center`}>
				<div id="pagination" class={tw`${paginationStyles}`}>
					<a class={tw`${paginationButtonStyles}`} href={getUrlForPage(url, 0)}>First Page</a>
					<a class={tw`${paginationButtonStyles}`} href={getUrlForPage(url, page - 1)}>Previous</a>
					<span class={tw`${paginationDisabledButtonStyles}`}>{page + 1}</span>
					<a class={tw`${paginationButtonStyles}`} href={getUrlForPage(url, page + 1)}>Next</a>
					<a class={tw`${paginationButtonStyles}`} href={getUrlForPage(url, Math.ceil(results.count / pageSize) - 1)}>Last Page</a>
				</div>
			</div>
			<div id="searchResults" class={tw`table table-fixed w-full p-5`}>
				<div class={tw`table-row bg-gray-100`}>
					{moduleIds.map(m => 
						<span class={tw`table-cell p-1`}>{m}</span>
					)}
				</div>
				{results.orderedResults.map(resultParallelIds => //ordered results are arrays of parallel ids for each result (because results could be sentences that span across verses)
					<div class={tw`table-row hover:bg-blue-100`}>
						{moduleIds.map(m => {
							const moduleTexts = results.matchingText.filter(r => r.moduleId === m && resultParallelIds.includes(r.parallelId))
							const rids = moduleTexts.map(m => m.rid)
							return <span class={tw`table-cell p-1`}>
								<span>{generateReference(rids)}</span>
								{resultParallelIds.map(p =>
									textToView(moduleTexts.find(mt => mt.parallelId === p)?.text || "")
								)}
							</span>
						})}
					</div>
				)}
			</div>
		</>
	)
	
}
const renderTermSearchHtml = async (results: TermSearchResponse, page: number, pageSize: number, url: URL) => {
	// 1. Reset the sheet for a new rendering
	// sheet.reset()

	// 2. Render the app
	const body = await renderBody(results, page, pageSize, url)

	// 3. Create the style tag with all generated CSS rules
	const styleTag = getStyleTag(sheet)

	// 4. Generate the response html
	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<script src="https://cdn.jsdelivr.net/npm/turbolinks@5.2.0/dist/turbolinks.js"></script>
		${styleTag}
	</head>
	<body>
		${body}
		<script>Turbolinks.start()</script>
	</body>
</html>`
}
export { renderTermSearchHtml }
