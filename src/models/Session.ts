import { ReactiveAggregator } from "MWL@2026/core/Reactive/PropertySystem/Collections/ReactiveAggregator";
import { ReactiveProxy } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveObject";
import { pauseReactions, resumeReactions, triggerReactiveObject } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveScheduler";
import { NO_VALUE } from "MWL@2026/core/types";
import { StudentWorkData } from "TPEngine@2026/ports/codecs/StudentWork";
import { StudentWork } from "./StudentWork";

type SessionState = {
    readonly subjectURL: string,
    readonly filenames : Record<string, string>
    readonly solution: StudentWorkData;
    readonly studentWorks: Record<string, StudentWork>;
};

// getter doesn't produce keys.
const keys = [
    "filenames", "solution", "subjectURL", "studentWorks"
] as const satisfies (keyof SessionState)[];

export class Session extends ReactiveProxy<ReactiveAggregator>
                     implements SessionState {

    private readonly aggregator;

    constructor(data?: SessionState) {
        const aggregator = new ReactiveAggregator();
        super(aggregator);
        this.aggregator = aggregator;

        if( data !== undefined)
            this.set(data);
    }

    set(data: SessionState) {

        pauseReactions(this);

        for(let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            // @ts-expect-error
            if( data[key] ) this[key] = data[key];
        }

        resumeReactions(this);
    }

    protected _subjectURL: string = "";
    get subjectURL() { return this._subjectURL; }
    set subjectURL(subjectURL: string) {
        this._subjectURL = subjectURL;
        triggerReactiveObject(this);
    }

    protected _filenames: Record<string, string> = {};
    get filenames() { return this._filenames; }
    set filenames(filenames: Record<string, string>) {
        this._filenames = filenames;
        triggerReactiveObject(this);
    }

    // NOT reactive (RO).
    // enable replaceAll on aggregator.
    //TODO: create empty...
    protected _solution: StudentWorkData = NO_VALUE;
    get solution() { return this._solution }
    set solution(solution: StudentWorkData) {
        this._solution = solution;
        triggerReactiveObject(this);
    }

    protected _studentWorks: Record<string, StudentWork> = {};
    get studentWorks() { return this._studentWorks }
    set studentWorks(studentWorks: Readonly<Record<string, StudentWork>>) {
        this._studentWorks = studentWorks;
        this.aggregator.replaceAll(...Object.values(studentWorks));
    }
}