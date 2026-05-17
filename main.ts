


// nejaky zakladni program

const gcodeString: string = "G21 G90 M3 G1 X100 Y0 G1 X100 Y100 G1 X0 Y100 G1 X0 Y0 M5 M30 "
const myRobot: Robot = createDefaultRobot(gcodeString)
let started: boolean = false


input.onButtonPressed(Button.A, function() {
    started = true
})

basic.forever(function() {
    if (started) {
        myRobot.operateOperations()
    }
})