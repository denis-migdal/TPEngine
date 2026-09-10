import { baseStyle, initializeMetaRendering } from "../core/base";
import { defineWidget, Coordinator, DeferredEffects, View } from "MWL@2026/exports/Widget";
import { QFileModel } from "TPEngine@2026/models/Questions";
import { upload } from "TPEngine@2026/ports/stores/core/upload";

const QFileWidget = defineWidget(
    "q-file",
    Coordinator(QFileModel),
    View({
        content: __LOAD_FILE__("./index.html"),
        style  : [baseStyle, __LOAD_FILE__("./index.css")],
        elements: {
            grade    : HTMLElement,
            answer   : HTMLElement,
            content  : HTMLIFrameElement,
            uploadBtn: HTMLButtonElement,
            expandBtn  : HTMLElement,
            expandModal: HTMLDialogElement,
        },
        setup(ctrler) {

            const hasViewer = this.target.getAttribute("viewer") !== "false";
            const answerViewer = this.elements.content;

            const effects = DeferredEffects(ctrler, this.renderer);

            initializeMetaRendering(this, effects, true);

            if( hasViewer ) {

                // handle expansion
                const modal = this.elements.expandModal;
                const answerArea = this.elements.answer;

                this.elements.expandBtn.addEventListener("click", () => {
                    modal.append(answerViewer);
                    modal.showModal();
                })

                modal.addEventListener("click", (event) => {
                    if (event.target === modal) {
                        answerArea.append(answerViewer);
                        modal.close();
                    }
                });

                effects.add("answer", () => {
                    const answer = ctrler.properties.answer;

                    if( answer === null) {
                        // about:blank generate browser warnings.
                        // we could use a BlankPage (then do not set style)
                        // after load.
                        answerViewer.removeAttribute("src");
                        return;
                    }

                    const file = new Blob([answer.content], {type: answer.type});

                    answerViewer.src = URL.createObjectURL(file);
                });
            }

            this.elements.uploadBtn.addEventListener("click", async () => {

                const file = await upload(ctrler.properties.accept);

                if( file === null) return;
                
                ctrler.properties.answer = {
                    type   : file.type,
                    content: await file.arrayBuffer()
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
    })
);

export {QFileWidget};