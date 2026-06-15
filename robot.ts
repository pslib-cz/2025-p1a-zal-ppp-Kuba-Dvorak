class Robot {
    parameters: RobotParamets
    settings: RobotSettings
    simpleInstructions: Array<BasicInstruction>
    simpleInstrPointer: number
    robotServo: Servo
    information: RobotInformation
    motorInfo: MotorInformation
    runningOperation: boolean
    myParser: Parser
    parserInfo: ParserInfo
    operating: boolean

    constructor(params: RobotParamets, parserSettings: ParserInfo, inputedString: string, motorInfo: MotorInformation) {
        this.parameters = params
        this.robotServo = ServoHelper.createServo()
        this.settings = createBasicSettings()
        this.information = createBasicRobotInfo()
        this.simpleInstrPointer = 0
        this.runningOperation = false
        this.simpleInstructions = []
        this.parserInfo = parserSettings
        this.motorInfo = motorInfo
        this.myParser = new Parser(inputedString)
        this.operating = true
    }

    operateOperations(): void {
        if (this.runningOperation) {
            if (this.simpleInstructions[this.simpleInstrPointer].instrType === TypeOfBasicInstruction.arc) {
                this.runningOperation = this.operateBasicArc(this.simpleInstructions[this.simpleInstrPointer])
            }
            else {
                this.runningOperation = this.operateBasicInstr(this.simpleInstructions[this.simpleInstrPointer].absoluteTime)
            }
        }
        if (!this.runningOperation) {
            if (this.simpleInstrPointer >= this.simpleInstructions.length || this.simpleInstrPointer === -1) {
                const nextInstr: ComplexInstruction = this.myParser.readNextCharacter(this.parserInfo.responsiveCharacters, this.parserInfo.instructionCharacters)
                console.log(`Printing, current action: ${nextInstr.instrSet}, of type: ${nextInstr.instrType}`)
                this.readComplexInstr(nextInstr)
                if (nextInstr.instrSet === InstructionSet.end) {
                    console.log(`The parser enden`)
                    this.operating = false
                    control.runInBackground(() => music.playTone(200, 500))
                    basic.showIcon(IconNames.Meh)
                    return
                }
                if (nextInstr.instrSet === InstructionSet.stop) {
                    console.log(`The gcode ended, the print is done`)
                    this.operating = false
                    control.runInBackground(() => music.playTone(400, 500))
                    basic.showIcon(IconNames.Happy)
                    return
                }
                if (nextInstr.instrSet === InstructionSet.error) {
                    console.log(`The gcode has an error inside`)
                    this.operating = false
                    basic.showIcon(IconNames.Sad)
                    control.runInBackground(() => music.playTone(600, 500))
                    return
                }
            }

            if (this.simpleInstrPointer < this.simpleInstructions.length) {
                this.prepareBasicInstr(this.simpleInstructions[this.simpleInstrPointer])
                console.log(`Created new movement task, with parameters:
                 final time: ${this.simpleInstructions[this.simpleInstrPointer].absoluteTime},
                 period left: ${this.simpleInstructions[this.simpleInstrPointer].periods.wheelLeft},
                 period right: ${this.simpleInstructions[this.simpleInstrPointer].periods.wheelRight}`)
                this.runningOperation = true
            }
        }
    }

    prepareBasicInstr(instr: BasicInstruction): void {
        PCAmotor.StepperStart(this.motorInfo.rightWheel, instr.direction.wheelRight)
        PCAmotor.StepperStart(this.motorInfo.leftWheel, instr.direction.wheelLeft)
        instr.absoluteTime += control.millis()
        instr.absoluteTime = Math.round(instr.absoluteTime)
        instr.periods.wheelRight = Math.round(instr.periods.wheelRight)
        instr.periods.wheelLeft = Math.round(instr.periods.wheelLeft)
    }

    operateBasicInstr(finalTime: number): boolean {
        if (control.millis() >= finalTime) {
            PCAmotor.StepperStop(this.motorInfo.leftWheel)
            PCAmotor.StepperStop(this.motorInfo.rightWheel)
            console.log(`Ended new movement task, ended in time: ${control.millis()}`)
            this.simpleInstrPointer += 1
            return false
        }
        return true
    }

    operateBasicArc(instr: BasicInstruction): boolean {
        if (control.millis() <= instr.absoluteTime) {
            PCAmotor.StepperStart(this.motorInfo.rightWheel, instr.direction.wheelRight)
            PCAmotor.StepperStart(this.motorInfo.leftWheel, instr.direction.wheelLeft)

            if (instr.clockWise) {
                basic.pause(instr.periods.wheelRight)
                PCAmotor.StepperStop(this.motorInfo.rightWheel)
            }
            else {
                basic.pause(instr.periods.wheelLeft)
                PCAmotor.StepperStop(this.motorInfo.leftWheel)
            }
            basic.pause(Math.abs(instr.periods.wheelRight - instr.periods.wheelLeft))
            return true
        }
        else {
            PCAmotor.StepperStop(this.motorInfo.leftWheel)
            PCAmotor.StepperStop(this.motorInfo.rightWheel)
            this.simpleInstrPointer += 1
            return false
        }
    }

    readComplexInstr(instruction: ComplexInstruction): void {
        if (instruction.instrType === ComplexInstrType.changeSettings) {
            this.changeSetting(instruction.instrSet)
        }
        else if (instruction.instrType === ComplexInstrType.servos) {
            this.moveServo(instruction.instrSet)
        }
        else if (instruction.instrType === ComplexInstrType.movement) {
            this.createBasicInstruction(instruction.instrSet, instruction.instrParameters)
        }
    }

    createBasicInstruction(newSet: InstructionSet, newParameters: { [name: string]: number }): void {
        if (this.settings.units === InstructionSet.imperial) {
            newParameters[ResponsiveChars.x] *= 25.4
            newParameters[ResponsiveChars.y] *= 25.4
            newParameters[ResponsiveChars.j] *= 25.4
            newParameters[ResponsiveChars.i] *= 25.4
        }
        if (this.settings.mode === InstructionSet.relative) {
            newParameters[ResponsiveChars.x] += this.information.position.x
            newParameters[ResponsiveChars.y] += this.information.position.y
        }

        if (newSet === InstructionSet.line || newSet === InstructionSet.fastTravel) {
            this.solveLine(newParameters)
        }

        else if (newSet === InstructionSet.antiClockWise || newSet === InstructionSet.clockWise) {
            // I a J paramerty, jsou vzdy relativni
            newParameters[ResponsiveChars.i] += this.information.position.x
            newParameters[ResponsiveChars.j] += this.information.position.y
            this.solveArc(newParameters, newSet)
        }
    }

    solveArc(newParameters: { [name: string]: number }, instrSet: InstructionSet): void {
        const newPos: Position2D = { x: newParameters[ResponsiveChars.x], y: newParameters[ResponsiveChars.y] }
        const centrePos: Position2D = { x: newParameters[ResponsiveChars.i], y: newParameters[ResponsiveChars.j] }
        const distanceNow: number = absoluteDistance(this.information.position, centrePos)
        const distanceNew: number = absoluteDistance(newPos, centrePos)
        const difference: number = Math.abs(distanceNow - distanceNew)

        if (difference > this.parameters.arcToleration) {
            console.log(`The generated arc isn´t in the toleration, current distance from the centre: ${distanceNow},
                        distance new: ${distanceNew}, difference: ${difference}, toleration: ${this.parameters.arcToleration}`)
            console.log(`Compromis: Driving to the desired position, with the pen up`)
            this.moveServo(InstructionSet.up)
            this.solveLine(newParameters)
        }

        else {
            let arcAngle: number = Math.atan2((newPos.y - centrePos.y), (newPos.x - centrePos.x))
            arcAngle -= Math.atan2((this.information.position.y - centrePos.y), (this.information.position.x - centrePos.x))
            if (arcAngle > Math.PI) {
                arcAngle = -(Math.PI * 2 - arcAngle)
            }
            if (arcAngle < -Math.PI) {
                arcAngle = Math.PI * 2 + arcAngle
            }
            this.simpleInstructions.push(this.calculateArc(distanceNew, arcAngle, instrSet))
        }

    }

    solveLine(newParameters: { [name: string]: number }): void {
        const newPos: Position2D = { x: newParameters[ResponsiveChars.x], y: newParameters[ResponsiveChars.y] }
        // stary vektor = stary uhel

        let angleRotation: number = -(Math.atan2(this.information.headingVec.y, this.information.headingVec.x))
        this.information.headingVec = createUnitVector(this.information.position, newPos)
        const distance: number = absoluteDistance(this.information.position, newPos)
        this.information.position = newPos

        // novy vektor = novy uhel; potom novy uhel - stary uhel
        angleRotation += (Math.atan2(this.information.headingVec.y, this.information.headingVec.x))

        if (angleRotation > Math.PI) {
            angleRotation = -(Math.PI * 2 - angleRotation)
        }
        if (angleRotation < -Math.PI) {
            angleRotation = Math.PI * 2 + angleRotation
        }

        let clockWise: InstructionSet = InstructionSet.antiClockWise
        if (angleRotation < 0) {
            clockWise = InstructionSet.clockWise
        }

        this.simpleInstructions.push(this.calculateRotation(angleRotation, clockWise))
        this.simpleInstructions.push(this.calculateLine(distance))
    }

    calculateLine(lenght: number): BasicInstruction {
        let oneResult: BasicInstruction = {
            instrType: TypeOfBasicInstruction.forward,
            absoluteTime: 0,
            periods: {
                wheelLeft: 0,
                wheelRight: 0
            },
            direction: {
                wheelLeft: true,
                wheelRight: true
            },
            clockWise: false
        };

        oneResult.absoluteTime = (lenght / this.parameters.linearSpeed)
        console.log(`Calculated a line, that will take ${oneResult.absoluteTime} to complete, with lenght: ${lenght}`)
        oneResult.periods.wheelLeft = oneResult.absoluteTime
        oneResult.periods.wheelRight = oneResult.absoluteTime

        return oneResult
    }

    calculateRotation(angle: number, instrSet: InstructionSet): BasicInstruction {
        let oneResult: BasicInstruction = {
            instrType: TypeOfBasicInstruction.rotate,
            absoluteTime: 0,
            periods: {
                wheelLeft: 0,
                wheelRight: 0
            },
            direction: {
                wheelLeft: true,
                wheelRight: true
            },
            clockWise: false
        };

        oneResult.absoluteTime = ((angle * this.parameters.trackWidth) / this.parameters.linearSpeed)

        if (oneResult.absoluteTime < 0) {
            oneResult.absoluteTime *= -1
        }

        console.log(`Calculated a rotation, that will take ${oneResult.absoluteTime} to complete, by angle: ${angle}`)
        oneResult.periods.wheelLeft = oneResult.absoluteTime
        oneResult.periods.wheelRight = oneResult.absoluteTime

        if (instrSet === InstructionSet.clockWise) {
            oneResult.direction.wheelRight = false
        }

        else if (instrSet === InstructionSet.antiClockWise) {
            oneResult.direction.wheelLeft = false
        }

        return oneResult
    }

    calculateArc(arcRad: number, arcAngle: number, instrSet: InstructionSet): BasicInstruction {
        let oneResult: BasicInstruction = {
            instrType: TypeOfBasicInstruction.arc,
            absoluteTime: 0,
            periods: {
                wheelLeft: 0,
                wheelRight: 0
            },
            direction: {
                wheelLeft: true,
                wheelRight: true
            },
            clockWise: false
        };

        let deltaA = (arcAngle * (arcRad + this.parameters.trackWidth))
        let deltaB = (arcAngle * (arcRad - this.parameters.trackWidth))

        oneResult.absoluteTime = ((arcAngle * (arcRad + this.parameters.trackWidth)) / this.parameters.linearSpeed)

        if (oneResult.absoluteTime < 0) {
            oneResult.absoluteTime *= -1
        }
        console.log(`Calculated a arc, that will take ${oneResult.absoluteTime} to complete`)

        if (instrSet === InstructionSet.clockWise) {
            oneResult.clockWise = true
            oneResult.periods.wheelLeft = this.parameters.periodTime

            oneResult.periods.wheelRight = this.parameters.periodTime * (deltaB / deltaA)
            if (oneResult.periods.wheelRight < 0) {
                oneResult.direction.wheelRight = false
                oneResult.periods.wheelRight *= -1
            }

        }

        else if (instrSet === InstructionSet.antiClockWise) {
            oneResult.clockWise = false
            oneResult.periods.wheelRight = this.parameters.periodTime

            oneResult.periods.wheelLeft = this.parameters.periodTime * (deltaB / deltaA)
            if (oneResult.periods.wheelLeft < 0) {
                oneResult.direction.wheelLeft = false
                oneResult.periods.wheelLeft *= -1
            }
        }

        if (arcAngle < 0) {
            oneResult.direction.wheelLeft = !oneResult.direction.wheelLeft
            oneResult.direction.wheelRight = !oneResult.direction.wheelRight
            oneResult.clockWise = !oneResult.clockWise
        }

        return oneResult
    }

    moveServo(newSet: InstructionSet): void {
        if (newSet === InstructionSet.up || newSet === InstructionSet.down) {
            if (!(newSet === this.settings.pen)) {
                this.settings.pen = newSet
                if (newSet === InstructionSet.up) {
                    this.robotServo.down()
                }
                if (newSet === InstructionSet.down) {
                    this.robotServo.up()
                }
                basic.pause(500)
            }
        }
    }

    changeSetting(newSet: InstructionSet): void {
        if (newSet === InstructionSet.metric || newSet === InstructionSet.imperial) {
            this.settings.units = newSet
        }
        else if (newSet === InstructionSet.absolute || newSet === InstructionSet.relative) {
            this.settings.mode = newSet
        }
        else if (newSet === InstructionSet.pause) {
            console.log(`Pausing for 5 second`)
            basic.pause(5000)
        }
    }
}