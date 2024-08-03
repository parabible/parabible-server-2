import { Application, Router, Context } from "https://deno.land/x/oak@v6.5.0/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts"
import { convertDeserializedQueryObject } from "https://cdn.skypack.dev/friendly-serializer"
import { getModuleIdsFromModules } from "./helpers/moduleInfo.ts"
import { generateParallelIdQueryFromCorpora } from "./helpers/parallelIdQueryBuilder.ts"

// 604800 = 168 hours
// 21600  = 6 hours
const CACHE_FOR_N_SECONDS = 21600

type ErrorResponse = {
	error: boolean,
	code: string,
	message: string
}
const sendError = (ctx: Context, json: ErrorResponse, status: number) => {
	ctx.response.status = status
	ctx.response.body = json
}
const hasParams = (ctx: Context, paramList: string[]) => {
	const resultParams: any = {}
	const missingParams: string[] = []
	paramList.forEach(p => {
		const r = ctx.request.url.searchParams.get(p)
		if (!r) {
			missingParams.push(p)
		}
		else {
			resultParams[p] = r
		}
	})
	if (missingParams.length) {
		ctx.response.body = {
			error: true,
			code: "MISSING_PARAMETER",
			message: "Missing parameter(s): " + JSON.stringify(missingParams)
		}
		ctx.response.status = 400
		return [false, null]
	}
	return [true, resultParams]
}

// app.use((ctx: Context) => {
// 	const p = new URLSearchParams(String(ctx.url).split('?')[1])
// 	p.forEach((value, key) => {
// 		ctx.request["params"]
// 			.params[key] = value
// 	})
// })


const router = new Router()

// HEALTH ROUTE
import { get as getHealth } from "./routes/health.ts"
router.get("/api/v2/health", async (ctx) => {
	console.log("(GET) /HEALTH")

	try {
		await getHealth()
		ctx.response.body = "OK"
	}
	catch (error) {
		console.error("ERROR FETCHING WORD:")
		console.error(error)
		ctx.response.body = error.response
		ctx.response.status = error.status
	}
})

// MODULE ROUTE
import { get as getModule } from "./routes/module.ts"
router.get("/api/v2/module", async (ctx: Context) => {
	console.log("(GET) /MODULE")

	try {
		const modules: ModuleResponse = await getModule()
		ctx.response.body = modules
	}
	catch (error) {
		console.error("ERROR FETCHING MODULE DATA:")
		console.error(error)
		ctx.response.body = error.response
		ctx.response.status = error.status
	}
})

// WORD ROUTE
import { get as getWord } from "./routes/word.ts"
router.get("/api/v2/word", async (ctx) => {
	console.log("(GET) /WORD")
	const [hasP, params] = hasParams(ctx, ["moduleId", "wid"])
	if (!hasP) {
		return
	}
	const { moduleId, wid } = params

	try {
		const word: WordResponse = await getWord({ moduleId, wid })
		ctx.response.body = word
		ctx.response.headers.set("Cache-Control", "max-age=604800")
	}
	catch (error) {
		console.error("ERROR FETCHING WORD:")
		console.error(error)
		ctx.response.body = error.response
		ctx.response.status = error.status
	}
})

// TEXT ROUTE
import { get as getText } from "./routes/text.ts"
router.get("/api/v2/text", async (ctx) => {
	console.log("(GET) /TEXT")
	const [hasP, params] = hasParams(ctx, ["modules", "reference"])
	if (!hasP) {
		return
	}
	const { modules, reference } = params

	try {
		const parallelTexts: TextResponse = await getText({
			reference,
			modules,
		})
		ctx.response.body = parallelTexts
		ctx.response.headers.set("Cache-Control", "max-age=604800")
	}
	catch (error) {
		console.error("ERROR FETCHING WORD:")
		console.error(error)
		ctx.response.body = error.response
		ctx.response.status = error.status
	}
})

type TermSearchUrlParameters = {
	t: any[]
	treeNodeType: string
	modules: string
	corpusFilter: string
	page: string
	pageSize: string
}
// TERM SEARCH ROUTE
import { get as getTermSearch } from "./routes/termSearch.ts"
router.get("/api/v2/termSearch", async (ctx) => {
	console.log("(GET) /TERMSEARCH")
	const {
		t: unprocessedSearchTerms,
		treeNodeType,
		modules,
		corpusFilter,
		page: pageNumberString,
		pageSize: pageSizeString
	}: TermSearchUrlParameters = convertDeserializedQueryObject(Object.fromEntries(ctx.request.url.searchParams.entries()))
	const searchTerms: SearchTerm[] = unprocessedSearchTerms.map((t: any) => {
		const { inverted, ...term } = t
		return (inverted === "1" || inverted === "true")
			? { inverted: true, ...term }
			: { inverted: false, ...term }
	})

	if (!modules) {
		return sendError(ctx, {
			error: true,
			code: "NO_MODULES",
			message: "No modules provided"
		}, 400)
	}
	const moduleIds = getModuleIdsFromModules(modules)
	if (moduleIds.length === 0) {
		return sendError(ctx, {
			error: true,
			code: "NO_MODULES",
			message: "Could not parse module names. Try /api/v2/module for available modules."
		}, 400)
	}
	if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
		return sendError(ctx, {
			error: true,
			code: "NO_SEARCH_TERMS",
			message: "No search terms provided"
		}, 400)
	}
	if (!treeNodeType) {
		return sendError(ctx, {
			error: true,
			code: "NO_TREENODETYPE",
			message: "No TreeNode Type provided (verse, sentence, clause, phrase, parallel)"
		}, 400)
	}
	const possibleTreeNodeTypes = new Set(["phrase", "clause", "sentence", "verse", "parallel"])
	if (!possibleTreeNodeTypes.has(treeNodeType)) {
		return sendError(ctx, {
			error: true,
			code: "UNDEFINED_TREENODETYPE",
			message: "TreeNode Type must be one of [verse, sentence, clause, phrase, parallel]"
		}, 400)
	}
	if (!(pageNumberString === "" || pageNumberString === undefined)
		&& (isNaN(Number.parseInt(pageNumberString)) || +pageNumberString < 0)) {
		return sendError(ctx, {
			error: true,
			code: "NO_PAGE",
			message: "No page number provided. Expected integer ≥ 0."
		}, 400)
	}
	const page = pageNumberString === "" || pageNumberString === undefined
		? 0
		: +pageNumberString
	if (pageSizeString === undefined ||
		pageSizeString === "" ||
		isNaN(Number.parseInt(pageSizeString)) ||
		+pageSizeString < 0) {
		return sendError(ctx, {
			error: true,
			code: "NO_PAGE_SIZE",
			message: "No page number provided. Expected integer ≥ 0."
		}, 400)
	}
	if (+pageSizeString > 100) {
		return sendError(ctx, {
			error: true,
			code: "PAGE_SIZE_TOO_LARGE",
			message: "Page size too large. Maximum is 100."
		}, 400)
	}
	const pageSize = pageSizeString === "" || pageSizeString === undefined
		? 0
		: +pageSizeString

	// if (corpusFilter && typeof corpusFilter !== "string") {
	// 	return sendError(ctx, {
	// 		error: true,
	// 		code: "INCORRECT_CORPUS_FILTER_TYPE",
	// 		message: "Corpus Filter must be a string"
	// 	}, 400)
	// }
	const parallelIdQuery = corpusFilter ? generateParallelIdQueryFromCorpora({ corpusFilter, moduleIds }) : ""
	// TODO: some kind of sanity check on the quality of corpus filter input...
	// if (!parallelIdQuery) {
	// 	return sendError(ctx, {
	// 		error: true,
	// 		code: "CORPUS_FILTER_ERROR",
	// 		message: "Could not parse corpusFilter into corpora constraints."
	// 	}, 400)
	// }

	// ? await (getParallelIdsFromCorpusFilter({ corpusFilter, mainModuleId: moduleIds[0] }))
	// const parallelIdQuery = corpusFilter
	// 	? generateParallelIdQueryFromCorpora({
	// 		mainModuleId: moduleIds[0],
	// 		corpusFilter
	// 	})
	// 	: ""

	try {
		const matchingSyntaxNodes: TermSearchResponse = await getTermSearch({
			searchTerms,
			treeNodeType: treeNodeType as "phrase" | "clause" | "sentence" | "verse" | "parallel",
			moduleIds,
			parallelIdQuery,
			page,
			pageSize,
		})
		ctx.response.body = matchingSyntaxNodes
		ctx.response.headers.set("Cache-Control", "max-age=604800")
	}
	catch (error) {
		console.error(error)
		return sendError(ctx, {
			error: true,
			code: "UNDEFINED_ERROR",
			message: "An undefined error occurred"
		}, 500)
	}
})



// HIGHLIGHT ROUTE
import { get as getHighlight } from "./routes/highlight.ts"
router.get("/api/v2/highlight", async (ctx) => {
	console.log("(GET) /HIGHLIGHT")
	const {
		t: searchTerms,
		modules,
		corpusFilter,
	} = convertDeserializedQueryObject(Object.fromEntries(ctx.request.url.searchParams.entries()))


	if (!modules) {
		return sendError(ctx, {
			error: true,
			code: "NO_MODULES",
			message: "No modules provided"
		}, 400)
	}
	if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
		return sendError(ctx, {
			error: true,
			code: "NO_SEARCH_TERMS",
			message: "No search terms provided"
		}, 400)
	}
	if (!corpusFilter) {
		return sendError(ctx, {
			error: true,
			code: "NO_CORPUS_FILTER",
			message: "No corpus filter provided"
		}, 400)
	}
	if (corpusFilter && typeof corpusFilter !== "string") {
		return sendError(ctx, {
			error: true,
			code: "INCORRECT_CORPUS_FILTER_TYPE",
			message: "Corpus Filter must be a string"
		}, 400)
	}

	try {
		const matchingSyntaxNodes: HighlightResponse = await getHighlight({
			searchTerms,
			modules, //TODO: create parsing function to get ids from string
			corpusFilter,
		})
		ctx.response.body = matchingSyntaxNodes
		ctx.response.headers.set("Cache-Control", `max-age=${CACHE_FOR_N_SECONDS}`)
	}
	catch (error) {
		console.log(error)
		return sendError(ctx, {
			error: true,
			code: "UNDEFINED_ERROR",
			message: "An undefined error occurred"
		}, 500)
	}
})

const app = new Application()
app.use(oakCors({
	origin: '*',
}))
app.use(router.routes())
app.use(router.allowedMethods())
app.addEventListener("listen", () => {
	console.log("Ready!")
})
app.listen({
	port: +(Deno.env.get("PORT") || 3000)
})
