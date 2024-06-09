import { query } from "../database/connection.ts";
import { generateParallelIdQueryFromCorpora } from "../helpers/parallelIdQueryBuilder.ts";
import { getTextQuery } from "../helpers/parallelTextQueryBuilder.ts";
import { getParallelOrdering } from "../helpers/parallelIdOrderQueryBuilder.ts";
import {
  getModuleIdsFromModules,
  getVersificationSchemaIdFromModuleId,
} from "../helpers/moduleInfo.ts";
import { mapTextResult } from "../helpers/mapTextResult.ts";

const getMatchingTextForModuleAndRow = (
  moduleId: number,
  parallelId: number,
  matchingTextResult: ParallelTextQueryResult,
) => {
  const matchingText = matchingTextResult.find(
    (row) => row.moduleId === moduleId && row.parallelId === parallelId,
  );
  return matchingText ? mapTextResult(matchingText) : null;
};

type Params = {
  modules: string;
  reference: string;
};
const get = ({ reference, modules }: Params) =>
  new Promise<TextResponse>((mainResolve, mainReject) => {
    const moduleIds = getModuleIdsFromModules(modules);
    const parallelIdQuery = generateParallelIdQueryFromCorpora({
      corpusFilter: reference,
      moduleIds,
    });

    Promise.all([
      new Promise<ParallelTextQueryResult>((resolve, reject) => {
        const q = getTextQuery({ parallelIdQuery, moduleIds });
        return query(q).then(
          (parallelTextResult: ClickhouseResponse<ParallelTextQueryResult>) => {
            resolve(parallelTextResult.data);
          },
        ).catch(reject);
      }),
      new Promise<ParallelOrderingResult>((resolve, reject) => {
        const versificationSchemaId = getVersificationSchemaIdFromModuleId(
          moduleIds[0],
        );
        const q = getParallelOrdering({
          parallelIdQuery,
          versificationSchemaId,
        });
        return query(q).then(
          (orderingResult: ClickhouseResponse<ParallelOrderingResult>) => {
            resolve(orderingResult.data);
          },
        ).catch(reject);
      }),
    ]).then(([matchingText, order]: [
      matchingText: ParallelTextQueryResult,
      order: ParallelOrderingResult,
    ]) => {
      mainResolve(
        order.map((row) =>
          moduleIds.map((moduleId) =>
            getMatchingTextForModuleAndRow(
              moduleId,
              row.parallelId,
              matchingText,
            )
          )
        ),
      );
    }).catch((error) => {
      console.error("Error while gathering words and paralel text");
      console.error(error);
      mainReject(error);
    });
  });
export { get };
