import { WithProperties } from "MWL@2026/exports/Reactive/PropertySystem";
import { QProperties, QuestionsRegistry } from "./core/interface";

import {Constant, Fixed} from "MWL@2026/exports/Reactive/PropertySystem/controllers";

export type QFileAnswer = {
    type   : string,
    content: ArrayBuffer
}

// we assume empty string = null, avoid handling this special case.
const QFileModel = WithProperties({
    ...QProperties<QFileAnswer|null>(null),
    type  : Constant<string>("QFile"),
    accept: Fixed<string>(".*"),
});

type QFileModel = InstanceType<typeof QFileModel>;

QuestionsRegistry["QFile"] = QFileModel;

export {QFileModel};
