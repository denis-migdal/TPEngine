import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { Fixed } from "MWL@2026:Reactive/Properties/Controllers";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";

import { baseStyle, initializeMetaRendering, QProperties } from "../core/base";
import { upload } from "TPEngine@2026:core/DataStore/core/upload";

import createPropertiesDeferredRenderer from "MWL@2026:DOM/FrameScheduler/defer/createPropertiesDeferredRenderer";

// TODO: could find a more optimal structure ?
export type QFileAnswer = {
    type   : string,
    content: string,
}

// we could also have a default URL...
export const QFileProperties = {
    ...QProperties<QFileAnswer|null>(null),
    accept: Fixed<string>(".*"),
}

export default defineWebComponent({
        name      : "q-file",
        Controller: WithProperties(QFileProperties),
        content: __LOAD_FILE__("./index.html"),
        style  : [baseStyle, __LOAD_FILE__("./index.css")],
        elements: {
            grade    : HTMLElement,
            answer   : HTMLIFrameElement,
            uploadBtn: HTMLButtonElement,
        },
        initialize(ctrler) {

            const hasViewer = this.target.getAttribute("viewer") !== "false";
            const answerViewer = this.elements.answer;

            const propsRenderer = createPropertiesDeferredRenderer(ctrler, this.renderer);

            initializeMetaRendering(this, propsRenderer, true);

            if( hasViewer )
                propsRenderer.bind("answer", () => {
                    const answer = ctrler.properties.answer;

                    if( answer === null) {
                        answerViewer.src = "about:blank";
                        return;
                    }

                    const file = new Blob([Uint8Array.fromBase64(answer.content)], {type: answer.type});

                    answerViewer.src = URL.createObjectURL(file);
                });

            this.elements.uploadBtn.addEventListener("click", async () => {

                console.warn(ctrler.properties.accept);
                const file = (await upload(ctrler.properties.accept))!;
                
                ctrler.properties.answer = {
                    type   : file.type,
                    content: (await file.bytes()).toBase64()
                }
            });

            // resize image...
            answerViewer.addEventListener("load", () => {
                const content = answerViewer.contentDocument!;
                
                if( content.body !== null) {
                    const style = content.body.style;

                    style.setProperty('height'         , '100vh')
                    style.setProperty('width'          , '100vw')
                    style.setProperty('margin'         , '0')
                    style.setProperty('display'        , 'flex');
                    style.setProperty('align-items'    , 'center');
                    style.setProperty('justify-content', 'center');
                } else {
                    const style = content.documentElement.style;
                    style.setProperty("width" , "100vw")
                    style.setProperty("height", "100vh")
                }
            });
        }
    });