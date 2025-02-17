
let index = 0
let tempClassPrediction = ""
let tempClassName = ""
let serialParts: string[] = []
let SerialData = ""
let ClassName: string[] = []
let ClassPrediction: number[] = []
ClassPrediction = []
serial.redirectToUSB()

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    SerialData = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    serialParts = SerialData.split(":")
    tempClassName = serialParts[0]
    tempClassPrediction = serialParts[1]
    index = ClassName.indexOf(tempClassName)
    if (index == -1) {
        ClassName.push(tempClassName)
        ClassPrediction.push(parseFloat(tempClassPrediction))
    } else {
        ClassPrediction[index] = parseFloat(tempClassPrediction)
    }
})