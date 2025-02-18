//% weight=100 color=#DC22E1 block="MINTspark TeachableMachine" blockId="MINTspark TeachableMachine" icon="\uf0e7"
namespace ms_tmai {
    let ClassName: string[] = []
    let ClassPrediction: number[] = []
    let topClassName = "";
    let topClassIndex = -1;
    let topClassPrediction = -1;
    let minCertainty = 0;
    let runClassification:boolean = false;

    //% weight=60
    //% block="Start Classification with Min Certainty %certainty"
    export function startClassification(certainty:number) : void {
        minCertainty = certainty / 100;
        serial.redirectToUSB()
        runClassification = true;
    }

    //% weight=55
    //% block="Stop Classification"
    export function stopClassification(): void {
        runClassification = false;
        resetParameter;
    }

    let onClassificationChangedHandler: (PredictionName: string, Score: number) => void;

    //% weight=60
    //% block="Classification Changed"
    //% draggableParameters = reporter
    //% color=#00B1ED
    export function onClassificationChanged(handler: (PredictionName: string, Score: number) => void) {
        onClassificationChangedHandler = handler;
    }

    //% weight=70
    //% block="ClassifiedName"
    //% color=#00B1ED
    export function getTopPredictioName():string {
        return topClassName;
    }

    //% weight=68
    //% block="ClassifiedScore"
    //% color=#00B1ED
    export function getTopPredictioScore(): number {
        return topClassPrediction;
    }


    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        if (!runClassification) return;
        let SerialData = serial.readUntil(serial.delimiters(Delimiters.NewLine))
        let serialParts = SerialData.split(":")
        let tempClassName = serialParts[0]
        let tempClassPrediction = serialParts[1]
        let index = ClassName.indexOf(tempClassName)

        if (index == -1) {
            ClassName.push(tempClassName)
            ClassPrediction.push(parseFloat(tempClassPrediction))
        } else {
            ClassPrediction[index] = parseFloat(tempClassPrediction)
        }
    })

    control.inBackground(() => {
        let lastIndex = -1;
        let lastTopScore = 0;

        while (true) {
            if (runClassification)
            {
                let hasChanged = false;
                setTopClassification();

                if (onClassificationChangedHandler != null)
                {
                    if (topClassPrediction < minCertainty && lastTopScore >= minCertainty) {
                        lastIndex = -1;
                        onClassificationChangedHandler("", -1);
                    }
                    else if (topClassPrediction >= minCertainty && lastTopScore < minCertainty) {
                        lastIndex = topClassIndex;
                        onClassificationChangedHandler(topClassName, topClassPrediction);
                    }
                    else if (lastIndex != topClassIndex && topClassPrediction >= minCertainty) {
                        lastIndex = topClassIndex;
                        onClassificationChangedHandler(topClassName, topClassPrediction);
                    }

                    lastTopScore = topClassPrediction;
                }
            }

            basic.pause(300);
        }
    })

    // Get top Classification
    function setTopClassification(): void {
        let max:number = -1;
        let newIndex:number = -1;

        for (let i = 0; i < ClassPrediction.length; i++)
        {
            let value:number = ClassPrediction[i];
            if (value > max)
            {
                newIndex = i;
                max = value;
            }
        }

        topClassPrediction = max;
        if (newIndex != topClassIndex) {
            topClassIndex = newIndex;
            topClassName = ClassName[newIndex];
        }
    }

    function resetParameter(): void {
        ClassName = [];
        ClassPrediction = [];
        topClassName = "";
        topClassIndex = -1;
        topClassPrediction = -1;
        minCertainty = 0;
    }
}
