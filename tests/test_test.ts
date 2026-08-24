import "@config";
import { assertEquals } from "std/assert";

import {ReactiveAggregator} from "MWL@2026/core/Reactive/PropertySystem/Collections/ReactiveAggregator";
import { listen } from "MWL@2026/exports/Reactive/Events.ts";

import {QMultiTextModel, QTextModel, QuestionModel} from "TPEngine@2026/models/Questions";
import {StudentWork} from "TPEngine@2026/models/StudentWork";
import { Properties } from "MWL@2026/core/Reactive/PropertySystem/Properties/Properties.ts";
import { Value } from "MWL@2026/core/Reactive/PropertySystem/Controllers/Value.ts";
import { bindProperties } from "MWL@2026/exports/Reactive/PropertySystem/index.ts";
import { map } from "MWL@2026/core/Reactive/PropertySystem/Properties/sync.ts";

Deno.test("aggregator", () => {

    const q = {
        "q1": new QTextModel(),
        "q2": new QMultiTextModel(),
    } satisfies Record<string, QuestionModel>

    const aggregator = new ReactiveAggregator();

    aggregator.add(...Object.values(q));

    let called = false;

    listen(aggregator, () => {
        called = true;
    });

    q.q2.comment = "ok";

    assertEquals(called, true);
});


Deno.test("bind", () => {

    const a = Properties({lang: Value("e"), foo: Value("ok")});
    const b = Properties({lang: Value("e"), faa: Value("nok")});
    bindProperties(a, b, map("lang", ["foo", "faa"]));

    let count = 0;
    listen(a, () => ++count);
    listen(b, () => ++count);

    a.foo = "1";
    b.faa = "2";


    assertEquals(count, 4);
});

Deno.test("student work", () => {

    const work = new StudentWork();

    work.questions = {
        "q1": new QTextModel(),
        "q2": new QMultiTextModel(),
    };

    let called = false;

    listen(work, () => {
        called = true;
    });

    work.questions.q2.comment = "ok";

    assertEquals(called, true);
});