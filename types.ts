

type RobotParamets = {
    trackWidth: number
    wheelRadius: number
    angelarSpeed: number
    periodTime: number
    linearSpeed: number
    arcToleration: number
}


type MotorInformation = {
    leftWheel: PCAmotor.Steppers
    rightWheel: PCAmotor.Steppers
}


type Vector2D = {
    x: number
    y: number
}


type Position2D = {
    x: number
    y: number
}


type RobotInformation = {
    position: Position2D
    headingVec: Vector2D
}

type ParserInfo = {
    responsiveCharacters: Array<string>
    instructionCharacters: Array<string>
}


enum InstructionSet {
    fastTravel = 1,
    line = 2,
    pause = 3,
    metric = 4,
    imperial = 5,
    absolute = 6,
    relative = 7,
    up = 8,
    down = 9,
    clockWise = 10,
    antiClockWise = 11,
    end = 12,
    stop = 13,
    error = 14
}


type Units = InstructionSet.metric | InstructionSet.imperial

type Mode = InstructionSet.absolute | InstructionSet.relative

type PenMode = InstructionSet.up | InstructionSet.down


type RobotSettings = {
    mode: Mode
    units: Units
    pen: PenMode
}


enum TypeOfBasicInstruction {
    forward = 1,
    rotate = 2,
    arc = 3
}


type WheelPeriods = {
    wheelLeft: number
    wheelRight: number
}


type WheelDirections = {
    wheelLeft: boolean
    wheelRight: boolean
}


type BasicInstruction = {
    instrType: TypeOfBasicInstruction
    absoluteTime: number
    direction: WheelDirections
    periods: WheelPeriods
    clockWise: boolean
}


enum ComplexInstrType {
    servos = 1,
    changeSettings = 2,
    movement = 3
}


type ComplexInstruction = {
    instrType: ComplexInstrType
    instrSet: InstructionSet
    instrParameters: { [name: string]: number }
}


type ResultAngle = {
    fullTime: number,
    periodA: number,
    periodB: number,
    direction: boolean
}


const ResponsiveChars = {
    x: "X",
    y: "Y",
    i: "I",
    j: "J",
    speed: "F"
}

