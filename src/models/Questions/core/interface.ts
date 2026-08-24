import { WithPropertiesCstr } from "MWL@2026/core/Reactive/PropertySystem/Properties/WithProperties";
import {Fixed, Value} from "MWL@2026/exports/Reactive/PropertySystem/controllers";

export function QProperties<T>(initialAnswer: T) {
    return {
        type   : Fixed<string>(""),
        qid    : Fixed<string|null>(null),
        comment: Value<string>(""),
        answer : Value(initialAnswer),
        score  : Value<number|null>(null),
        coeff  : Fixed<number|null>(null),
    }
}

export const QuestionsRegistry: Record<string, WithPropertiesCstr<{readonly type: string}>> = {};