
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


function createDefaultRobot(gcode: string): Robot {
    if (gcode === "") {
        gcode = "a"
    }
    gcode += ";"
    return new Robot(
        {
            trackWidth: 71,
            wheelRadius: 32,
            angelarSpeed: (Math.PI / 5000),
            periodTime: 250,
            arcToleration: 1,
            linearSpeed: ((Math.PI / 5000) * 32)
        },
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
