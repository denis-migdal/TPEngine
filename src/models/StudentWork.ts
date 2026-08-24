//TODO: use exports
import {ReactiveAggregator} from "MWL@2026/core/Reactive/PropertySystem/Collections/ReactiveAggregator";
import { ReactiveProxy } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveObject";
import { QuestionModel } from "./Questions";

type Questions = Readonly<Record<string, QuestionModel>>;

export class StudentWork extends ReactiveProxy<ReactiveAggregator> {

    private readonly aggregator;

    constructor(questions?: Questions) {
        const aggregator = new ReactiveAggregator();
        super(aggregator);
        this.aggregator = aggregator;

        if( questions !== undefined)
            this.questions = questions;
    }

    private _questions: Questions = {};
    get questions() { return this._questions; }
    set questions(questions: Questions) {
        this._questions = questions;
        this.aggregator.replaceAll(...Object.values(questions));
    }
}