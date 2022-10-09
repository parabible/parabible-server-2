import bookDetails from "../data/bookDetails.json" assert { type: "json" }
import ReferenceParser from "https://cdn.skypack.dev/-/referenceparser@v1.2.1-NsxZPhwRcBqBTOeZY5MD/dist=es2019,mode=imports/optimized/referenceparser.js"
const rp = new ReferenceParser()

const _getBookInt = (book: string) => {
	return bookDetails.indexOf(book) + 1
}

const generateRid = (reference: Reference) => {
	const book = _getBookInt(reference.book) * 1000000
	const ch = reference.chapter * 1000
	const v = reference.verse ? reference.verse : 0
	return book + ch + v
}

const parse = (ref: string) => rp.parse(ref.trim())
export {
	parse,
	generateRid,
}