//% weight=100 color=#DC22E1 block="MINTspark TeachableMachine" blockId="MINTspark TeachableMachine" icon="\uf0e7"
namespace ms_tmai {
    let ClassName: string[] = []
    let ClassPrediction: number[] = []
    let topClassName = "";
    let topClassIndex = -1;
    let topClassPrediction = -1;

    serial.redirectToUSB()

    // Get top Classification
    export function setTopClassification() : void
    {
        let max:number = ClassPrediction.reduce((acc, val) => { acc > val ? acc : val }, null);
        topClassIndex = ClassPrediction.indexOf(max);
        topClassName = ClassName[topClassIndex];
        topClassPrediction = max;
    }

    // Get current Classification

    const ClassificationEventId = 53731;
    let onClassificationChangedHandler: (className: string) => void;

    //% weight=60
    //% block="Classification Changed"
    //% color=#00B1ED
    export function onClassificationChanged(minThreshold: number, handler: (className: string) => void) {
        onClassificationChangedHandler = handler;
        let lasttopClassIndex = -1;

        control.inBackground(() => {
            while (true) {
                if (topClassIndex != lasttopClassIndex) {
                    if (topClassPrediction >= minThreshold )
                    {
                        onClassificationChangedHandler(topClassName);
                        lasttopClassIndex = topClassIndex;
                    }
                    else{
                        onClassificationChangedHandler("");
                        lasttopClassIndex = -1;
                    }
                }
                
                basic.pause(200);
            }
        })
    }

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
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
}