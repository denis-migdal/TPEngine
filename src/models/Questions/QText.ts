import { WithProperties } from "MWL@2026/exports/Reactive/PropertySystem";
import { QProperties, QuestionsRegistry } from "./core/interface";

import {Constant, Value} from "MWL@2026/exports/Reactive/PropertySystem/controllers";

// we assume empty string = null, avoid handling this special case.
const QTextModel = WithProperties({
    ...QProperties<string>(""),
    type   : Constant<string>("QText"),
    lang   : Value<string|null>(null),
});

type QTextModel = InstanceType<typeof QTextModel>;

QuestionsRegistry["QText"] = QTextModel;

export {QTextModel};