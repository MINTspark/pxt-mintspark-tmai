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
        minCertainty = certainty;
        serial.redirectToUSB()
        runClassification = true;
    }

    //% weight=55
    //% block="Stop Classification"
    export function stopClassification(): void {
        runClassification = false;
        resetParameter;
    }

    // Get current Classification
    const ClassificationEventId = 53731;
    let onClassificationChangedHandler: (PredictionName: string, Score: number) => void;

    //% weight=60
    //% block="Classification Changed"
    //% draggableParameters = reporter
    //% color=#00B1ED
    export function onClassificationChanged(handler: (PredictionName: string, Score: number) => void) {
        if (!runClassification) return;
        onClassificationChangedHandler = handler;
    }

    //% weight=70
    //% block="ClassifiedName"
    //% draggableParameters = reporter
    //% color=#00B1ED
    export function getTopPredictioName():string {
        return topClassName;
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

        setTopClassification();
    })

    // Get top Classification
    export function setTopClassification(): void {
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

        let hasChanged = false;

        if ((topClassPrediction < minCertainty && max >= minCertainty) || (topClassPrediction >= minCertainty && max < minCertainty))
        {
            hasChanged = true;
        }

        topClassPrediction = max;

        if (newIndex != topClassIndex)
        {
            topClassIndex = newIndex;
            topClassName = ClassName[topClassIndex];    
            hasChanged = true;     
        }

        if (hasChanged && onClassificationChangedHandler != null)
        {
            if (max < minCertainty)
            {
                onClassificationChangedHandler("None",-1);
            }
            else{
                onClassificationChangedHandler(topClassName, topClassPrediction);
            }
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
