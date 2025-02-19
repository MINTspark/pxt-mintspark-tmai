//% weight=100 color=#DC22E1 block="MINTspark Google TM" blockId="MINTspark TeachableMachine" icon="\uf0e7"
namespace ms_tmai {
    let ClassName: string[] = []
    let ClassPrediction: number[] = []
    let topClassName = "";
    let topClassIndex = -1;
    let topClassPrediction = -1;
    let minCertainty = 0;
    let runClassification:boolean = false;

    //% weight=100
    //% block="Start Classification Min Score %certainty"
    export function startClassification(certainty:number) : void {
        minCertainty = certainty / 100;
        serial.redirectToUSB()
        runClassification = true;
    }

    //% weight=95
    //% block="Stop Classification"
    export function stopClassification(): void {
        runClassification = false;
        resetParameter;
    }

    let onClassificationChangedHandler: (predictionName: string, score: number) => void;

    //% weight=50
    //% block="Classification Changed"
    //% draggableParameters = reporter
    //% color=#00B1ED
    //% blockGap=8
    export function onClassificationChanged(handler: (Class: string, Score: number) => void) {
        onClassificationChangedHandler = handler;
    }

    //% weight=80
    //% block="Current Classification"
    //% color=#00B1ED
    export function getTopPredictioName():string {
        return topClassName;
    }

    //% weight=75
    //% block="Current Score"
    //% color=#00B1ED
    export function getTopPredictioScore(): number {
        return topClassPrediction;
    }

    //% weight=70
    //% block="Get score for class %name"
    //% color=#00B1ED
    export function getClassScore(name:string): number {
        let index = ClassName.indexOf(name);
        if (index > -1)
        {
            return ClassPrediction[index];
        }

        return NaN;
    }

    //% weight=65
    //% block="All Class Names"
    //% color=#00B1ED
    export function getClassNames(): string[] {
        return ClassName;
    }


    let serialReadInProgress = false;
    let firstUpdate = true;

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        
        if (serialReadInProgress || !runClassification)
        {
            serial.readString();
            return;
        }

        serialReadInProgress = true;
        let rxData = serial.readUntil(serial.delimiters(Delimiters.NewLine))
        let messageParts = rxData.split(";")
        
        for (let classificationString of messageParts)
        {
            let classificationParts = classificationString.split(":");
            let tempClassName = classificationParts[0]
            let tempClassPrediction = classificationParts[1]

            if (firstUpdate)
            {
                ClassName.push(tempClassName)
                ClassPrediction.push(parseFloat(tempClassPrediction))
            }
            else
            {
                let index = ClassName.indexOf(tempClassName)
                if (index == -1) {
                    basic.showString(tempClassName);
                    serialReadInProgress = false;
                    return;
                } else {
                    ClassPrediction[index] = parseFloat(tempClassPrediction)
                }
            }
        }
        
        firstUpdate = false;
        serialReadInProgress = false;
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
