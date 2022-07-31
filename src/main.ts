import { Application, Router, Context } from "https://deno.land/x/oak@v6.5.0/mod.ts"
import { convertDeserializedQueryObject } from "https://cdn.skypack.dev/friendly-serializer"

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
	const [hasP, params] = hasParams(ctx, ["modules", "corpusFilter"])
	if (!hasP) {
		return
	}
	const { modules, corpusFilter } = params

	try {
		const parallelTexts: TextResponse = await getText({
			corpusFilter,
			modules,
		})
		ctx.response.body = parallelTexts
	}
	catch (error) {
		console.error("ERROR FETCHING WORD:")
		console.error(error)
		ctx.response.body = error.response
		ctx.response.status = error.status
	}
})


// TERM SEARCH ROUTE
import { get as getTermSearch } from "./routes/termSearch.ts"
router.get("/api/v2/termSearch", async (ctx) => {
	console.log("(GET) /TERMSEARCH")
	const {
		t: searchTerms,
		treeNodeType,
		modules,
		corpusFilter,
		pageNumber,
		pageSize
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
	if (!treeNodeType) {
		return sendError(ctx, {
			error: true,
			code: "NO_TREENODETYPE",
			message: "No TreeNode Type provided (verse, sentence, clause, phrase)"
		}, 400)
	}
	if (corpusFilter && typeof corpusFilter !== "string") {
		return sendError(ctx, {
			error: true,
			code: "INCORRECT_CORPUS_FILTER_TYPE",
			message: "Corpus Filter must be a string"
		}, 400)
	}

	// ? await (getParallelIdsFromCorpusFilter({ corpusFilter, mainModuleId: moduleIds[0] }))
	// const parallelIdQuery = corpusFilter
	// 	? generateParallelIdQueryFromCorpora({
	// 		mainModuleId: moduleIds[0],
	// 		corpusFilter
	// 	})
	// 	: ""

	try {
		const matchingSyntaxNodes = await getTermSearch({
			searchTerms,
			treeNodeType,
			modules,
			corpusFilter,
			pageNumber,
			pageSize,
		})
		ctx.response.body = matchingSyntaxNodes
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
		versificationSchema,
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
		const matchingSyntaxNodes = await getHighlight({
			searchTerms,
			modules, //TODO: create parsing function to get ids from string
			corpusFilter,
		})
		ctx.response.body = matchingSyntaxNodes
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
app.use(router.routes())
app.use(router.allowedMethods())
app.addEventListener("listen", () => {
	console.log("Ready!")
})
app.listen({ port: 3000 })