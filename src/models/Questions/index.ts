import { QTextModel } from "./QText";
import { QMultiTextModel } from "./QMultiText";
import { QFileModel } from "./QFile";
import { PropertiesShape } from "MWL@2026/core/Reactive/PropertySystem/Properties/PropertiesProvider";
import { QuestionsRegistry } from "./core/interface";

export {QTextModel, QMultiTextModel, QFileModel};

export type QuestionModel = QTextModel|QMultiTextModel|QFileModel;

export function createQuestionModel<T extends QuestionModel>(
                                data: PropertiesShape<T>
                            ): QuestionModel {

    return new QuestionsRegistry[data.type](data) as QuestionModel;
}