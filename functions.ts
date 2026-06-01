
function createBasicSettings(): RobotSettings {
    return {
        mode: InstructionSet.absolute,
        pen: InstructionSet.up,
        units: InstructionSet.metric
    }
}


function createBasicRobotInfo(): RobotInformation {
    return {
        position: { x: 0, y: 0 },
        headingVec: { x: 1, y: 0 }
    }
}


function addPositions(positionA: Position2D, positionB: Position2D): Position2D {
    return {
        x: positionA.x + positionB.x,
        y: positionA.y + positionB.y
    }
}


function createUnitVector(positionA: Position2D, positionB: Position2D): Vector2D {
    const diffX: number = positionB.x - positionA.x
    const diffY: number = positionB.y - positionA.y
    let c: number = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2))
    if (Math.abs(c) < 0.1) {
        c = 0.1
    }
    return {
        x: (diffX / c),
        y: (diffY / c)
    }
}


function absoluteDistance(positionA: Position2D, positionB: Position2D): number {
    return Math.sqrt(Math.pow(positionB.x - positionA.x, 2) + Math.pow(positionB.y - positionA.y, 2))
}


function makeAVector(posA: Position2D, posB: Position2D): Vector2D {
    return {
        x: posB.x - posA.x,
        y: posB.y - posA.y
    }
}


function dotProduct(vecA: Vector2D, vecB: Vector2D): number {
    return (vecA.x * vecB.x) + (vecA.y * vecB.y)
}


function calibrate(): RobotParamets {
    console.log("Setting up the parameters:")
    console.log("   If you want to use the premessured parameters press the logo button")
    console.log("   If you want to calibrate press the A button")
    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            break
        }

        if (input.logoIsPressed()) {
            return {
                trackWidth: 71,
                wheelRadius: 32,
                angelarSpeed: (Math.PI / 5000),
                periodTime: 250,
                arcToleration: 1,
                linearSpeed: ((Math.PI / 5000) * 32)
            }
        }
    }
    console.log("This is the calibration.")
    console.log("First discipline will be driving 1 meter,")
    console.log("You shall press the A button to start the jorney,")
    console.log("And press the B button to end the jorney,")
    console.log("The robot thinks the track was 1 meter, and messueres time,")
    console.log("Then it calculates the time.")
    console.log("Press A button to start...")

    let startTime: number = 0
    let entireTime: number = 0

    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            startTime = control.millis()
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1)
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM2)
            break
        }
    }

    while (true) {
        if (input.buttonIsPressed(Button.B)) {
            entireTime = control.millis() - startTime
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1)
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM2)
            break
        }
    }

    const linearSpeed: number = 1 / entireTime

    console.log(`Linear speed has been calibrated to: ${linearSpeed}.`)

    console.log("Next up is the anglelar velocity calibration,")
    console.log("The discipline will consist of one wheel rotating 360 degrees,")
    console.log("You shall press the button A to start the rotation,")
    console.log("And press button B to end the test.")
    console.log("Press A to start ...")

    let startTimeRotation: number = 0
    let entireTimeRotation: number = 0

    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            startTimeRotation = control.millis()
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1)
            break
        }
    }

    while (true) {
        if (input.buttonIsPressed(Button.B)) {
            entireTimeRotation = control.millis() - startTimeRotation
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1)
            break
        }
    }

    const anglelarSpeed: number = 2*Math.PI / entireTimeRotation

    const wheelRadius: number = linearSpeed / anglelarSpeed

    return {
        trackWidth: 71,
        wheelRadius: wheelRadius,
        angelarSpeed: anglelarSpeed,
        periodTime: 250,
        arcToleration: 1,
        linearSpeed: linearSpeed
    }
}


function createDefaultRobot(gcode: string): Robot {
    if (gcode === "") {
        gcode = "a"
    }
    gcode += ";"
    return new Robot(
        calibrate(),
        {
            responsiveCharacters: ["X", "Y", "I", "J", "F"],
            instructionCharacters: ["G", "M"]
        },
        gcode,
        {
            leftWheel: PCAmotor.Steppers.STPM1,
            rightWheel: PCAmotor.Steppers.STPM2
        }
    )
}
