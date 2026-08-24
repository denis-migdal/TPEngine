import { ARMultiTextWidget } from "./QMultiText";
import { ARTextWidget } from "./QText";
import { AnswerReviewRegistry } from "./core";
import { QuestionModel } from "TPEngine@2026/models/Questions";

export { ARTextWidget, ARMultiTextWidget };

export type ARWidget = ARTextWidget|ARMultiTextWidget;

export function createAnswerReviewWidget<T extends QuestionModel>(
                                model: T
                            ): ARWidget {

    return new AnswerReviewRegistry[model.type](model) as any as ARWidget;
}