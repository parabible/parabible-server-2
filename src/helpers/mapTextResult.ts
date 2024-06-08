export const mapTextResult = (
  parallelTextQueryResultRow: ParallelTextQueryResultRow,
): DisambiguatedTextResult => {
  const { parallelId, moduleId, rid, text } = parallelTextQueryResultRow;
  try {
    const maybeWordArray = JSON.parse(text);
    if (Array.isArray(maybeWordArray)) {
      return {
        parallelId,
        moduleId,
        rid,
        type: "wordArray",
        wordArray: maybeWordArray,
        html: "",
      };
    }
  } catch (e) {
    // Ignore this path.

    // We can't return here because we need to handle the text being
    // HTML but JSON.parse also succeeding (so the output is not the
    // expected array), e.g. if the text is surrounded in quotes.
  }
  return { parallelId, moduleId, rid, type: "html", wordArray: [], html: text };
};