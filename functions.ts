
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
    control.runInBackground(() => music.playTone(200, 100))
    basic.showString("?")
    console.log("Setting up the parameters:")
    console.log("   If you want to use the premessured parameters press the logo button")
    console.log("   If you want to calibrate and overwrite flash press the A button")
    console.log("   If you want to load setting from flash press the B button")

    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            basic.showIcon(IconNames.Yes)
            break
        }

        if (input.buttonIsPressed(Button.B)) {
            basic.showIcon(IconNames.Pitchfork)
            let trackWidth: any = flashstorage.getOrDefault("trackWidth", "nic");
            let linearSpeed: any = flashstorage.getOrDefault("linearSpeed", "nic");
            if (linearSpeed == "nic" || trackWidth == "nic") {
                console.log("No calibration was found on disk")
                console.log("please proceade with calibration...")
                break
            }
            else {
                console.log(`Linear speed has been calibrated to: ${linearSpeed}.`)
                console.log(`Track width has been calibrated to: ${trackWidth}.`)
                basic.clearScreen()
                return {
                    trackWidth: parseFloat(trackWidth),
                    periodTime: 250,
                    arcToleration: 1,
                    linearSpeed: parseFloat(linearSpeed)
                }
            }
        }

        if (input.logoIsPressed()) {
            console.log("Default setting chosen")
            basic.showIcon(IconNames.No)
            return {
                trackWidth: 71,
                periodTime: 250,
                arcToleration: 1,
                linearSpeed: ((Math.PI / 5000) * 35)
            }
        }
    }

    control.runInBackground(() => music.playTone(400, 100))
    basic.pause(1000)
    basic.clearScreen()
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
            control.runInBackground(() => music.playTone(200, 100))
            basic.showIcon(IconNames.Tortoise)
            startTime = control.millis()
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1)
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM2)
            break
        }
    }

    while (true) {
        if (input.buttonIsPressed(Button.B)) {
            control.runInBackground(() => music.playTone(400, 100))
            basic.showIcon(IconNames.Yes)
            entireTime = control.millis() - startTime
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1)
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM2)
            break
        }
    }

    entireTime /= 1000

    const linearSpeed: number = 1 / entireTime

    console.log(`Linear speed has been calibrated to: ${linearSpeed}.`)

    basic.pause(1000)
    basic.clearScreen()

    console.log("Next up is the track width calibration,")
    console.log("The discipline will consist of the robot rotating 5 times around 1 wheel,")
    console.log("You shall press the button A to start the rotation,")
    console.log("And press button B to end the test.")
    console.log("Press A to start ...")

    let startTimeRotation: number = 0
    let entireTimeRotation: number = 0

    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            control.runInBackground(() => music.playTone(200, 100))
            basic.showIcon(IconNames.Tortoise)
            startTimeRotation = control.millis()
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1)
            break
        }
    }

    while (true) {
        if (input.buttonIsPressed(Button.B)) {
            basic.showIcon(IconNames.Yes)
            control.runInBackground(() => music.playTone(400, 100))
            entireTimeRotation = control.millis() - startTimeRotation
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1)
            break
        }
    }

    entireTimeRotation /= 1000
    // the track width is already diveded by 2

    const trackWidth: number = (linearSpeed * entireTimeRotation) / (5 * Math.PI)

    flashstorage.put("trackWidth", `${trackWidth}`)
    flashstorage.put("linearSpeed", `${linearSpeed}`)

    basic.clearScreen()

    return {
        trackWidth: trackWidth,
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
