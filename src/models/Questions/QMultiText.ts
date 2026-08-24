import { WithProperties } from "MWL@2026/exports/Reactive/PropertySystem";
import { QProperties, QuestionsRegistry } from "./core/interface";

import {Constant, Fixed, Value, View} from "MWL@2026/exports/Reactive/PropertySystem/controllers";

// we assume empty string = null, avoid handling this special case.
const QMultiTextModel = WithProperties({
    ...QProperties<null|readonly string[]>(null),
    type    : Constant<string>("QMultiText"),
    nbFields: Fixed<number>(2),
    nbCols  : Fixed<number|null>(null),
    scores  : Value<readonly number[]|null>(null),
    score   : View("scores", (scores: readonly number[]|null) => {

        if( scores === null)
            return null;

        let sum = 0;
        for(let i = 0; i < scores.length; ++i)
            sum += scores[i]

        return sum / scores.length;
    }),
});

type QMultiTextModel = InstanceType<typeof QMultiTextModel>;

QuestionsRegistry["QMultiText"] = QMultiTextModel;

export {QMultiTextModel};