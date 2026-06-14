




// nejaky zakladni program

const gcodeString: string = "G21 G90 M3 G1 X100 Y0 G1 X100 Y100 F1000 G1 X50 Y150 F1000 G1 X0 Y100 F1000 G1 X100 Y100 F1000 M5 G1 X0 Y100 F1000 M3 G1 X0 Y0 F1000 G0 M5 G0 X0 Y0 M30"
const gcodeString2: string = "G21 G90 G0 X0 Y0 M3 G1 X50 Y0 G1 X50 Y50 G1 X0 Y50 G1 X0 Y0 M5 G0 X25 Y25 M3 G1 X75 Y25 G1 X75 Y75 G1 X25 Y75 G1 X25 Y25 M5 G0 X0 Y50 M3 G1 X25 Y75 M5 G0 X50 Y50 M3 G1 X75 Y75 M5 G0 X50 Y0 M3 G1 X75 Y25 M5 M30"
const gcodeString3: string = "G21 G90 G0 X-40 Y0 M3 G2 X40 Y0 I40 J0 G2 X-40 Y0 I-40 J0 M5 G0 X-15 Y20 M3 G2 X-15 Y20 I5 J0 M5 G0 X15 Y20 M3 G2 X15 Y20 I5 J0 M5 G0 X-25 Y-10 M3 G3 X25 Y-10 I25 J10 M5 M30"
const myRobot: Robot = createDefaultRobot(gcodeString2)
let started: boolean = false


input.onButtonPressed(Button.A, function() {
    started = true
})


basic.forever(function() {
    if (started) {
        myRobot.operateOperations()
    }
})