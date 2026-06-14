
class Parser {
    currentChar: number
    inputString: string

    constructor(inputString: string) {
        this.inputString = inputString
        this.currentChar = 0
    }

    isNumber(text: string): boolean {
        if (text === "0" || text === "1" || text === "2" || text === "3" || text === "4" || text === "5" || text === "6" || text === "7" || text === "8" || text === "9") {
            return true
        }
        return false
    }

    nextNumber(): number {
        let oneNumber: number = 0
        let negativity: boolean = false
        let float: boolean = false
        let floatinDecimal: number = 0
        let continuing: boolean = true
        let curChar: string = ""

        while (true) {
            curChar = this.inputString[this.currentChar]
            if (this.isNumber(curChar)) {
                break
            }

            if (curChar === "-") {
                negativity = true
            }

            this.currentChar += 1
            if (this.currentChar >= this.inputString.length) {
                console.log(`Big trouble, last command, which was supposed to get a number, didn´t find one.`)
                break
            }
        }

        while (true) {
            curChar = this.inputString[this.currentChar]
            if (!(this.isNumber(curChar)) && !(curChar === ".")) {
                break
            }

            if (curChar === "." && !float) {
                float = true
                continue
            }

            if (float) {
                floatinDecimal += 1
            }

            oneNumber *= 10
            oneNumber += +curChar
            this.currentChar += 1

            if (this.currentChar >= this.inputString.length) {
                break
            }
        }

        oneNumber /= Math.pow(10, floatinDecimal)
        if (negativity) {
            oneNumber *= -1
        }

        return oneNumber
    }

    mapOfKnownCmds(char: string, num: number): InstructionSet {
        if (char === "G") {
            if (num === 0) {
                return InstructionSet.fastTravel
            }
            if (num === 1) {
                return InstructionSet.line
            }
            if (num === 2) {
                return InstructionSet.clockWise
            }
            if (num === 3) {
                return InstructionSet.antiClockWise
            }
            if (num === 4) {
                return InstructionSet.pause
            }
            if (num === 20) {
                return InstructionSet.imperial
            }
            if (num === 21) {
                return InstructionSet.metric
            }
            if (num === 90) {
                return InstructionSet.absolute
            }
            if (num === 91) {
                return InstructionSet.relative
            }
        }

        if (char === "M") {
            if (num === 3) {
                return InstructionSet.down
            }
            if (num === 5) {
                return InstructionSet.up
            }
            if (num === 30) {
                return InstructionSet.stop
            }
        }

        console.log(`Unknown character: ${char}, or instruction number: ${num}`)
        return InstructionSet.error
    }

    mapOfKnownTypings(oneSet: InstructionSet): ComplexInstrType {
        if (oneSet === InstructionSet.up || oneSet === InstructionSet.down) {
            return ComplexInstrType.servos
        }
        else if (oneSet === InstructionSet.fastTravel || oneSet === InstructionSet.line || oneSet === InstructionSet.clockWise || oneSet === InstructionSet.antiClockWise) {
            return ComplexInstrType.movement
        }
        return ComplexInstrType.changeSettings
    }

    includesString(myList: Array<string>, item: string): boolean {
        for (let instance of myList) {
            if (instance === item) {
                return true
            }
        }
        return false
    }

    readNextCharacter(responsiveChar: Array<string>, instructionChar: Array<string>): ComplexInstruction {
        let instruction: ComplexInstruction = {
            instrType: ComplexInstrType.changeSettings,
            instrSet: InstructionSet.error,
            instrParameters: {}
        }
        // defaultne -1, kdyby doslo nekde k chybe, a potom bychom si console logovali, co nam odtud prislo, tak uvidime -1 => ponenticalni chyba
        for (let char of responsiveChar) {
            instruction.instrParameters[char] = -1
        }

        let firstInstr: boolean = false
        let curChar: string = ""

        while (true) {

            if (this.currentChar < this.inputString.length) {
                curChar = this.inputString[this.currentChar]
            }

            if (this.currentChar >= this.inputString.length - 1) {
                if (instruction.instrSet === InstructionSet.error) {
                    console.log(`Parser run into the end of the code: current position: ${this.currentChar}, total lenght: ${this.inputString.length}`)
                    instruction.instrSet = InstructionSet.end
                }
                break
            }

            if (this.includesString(instructionChar, curChar)) {
                // konec instrukce 1 a začátek instrukce 2 ...
                if (firstInstr) {
                    break
                }

                else {
                    console.log(`Current character: ${curChar}, is in the list of instruction characters`)
                    instruction.instrSet = this.mapOfKnownCmds(curChar, this.nextNumber())
                    firstInstr = true
                    continue
                }
            }

            if (this.includesString(responsiveChar, curChar)) {
                instruction.instrParameters[curChar] = this.nextNumber()
                continue
            }

            this.currentChar += 1
        }

        instruction.instrType = this.mapOfKnownTypings(instruction.instrSet)
        console.log(`Read command:  type: ${instruction.instrType},
                                    set: ${instruction.instrSet},
                                    x: ${instruction.instrParameters["X"]},
                                    y: ${instruction.instrParameters["Y"]},
                                    i: ${instruction.instrParameters["I"]},
                                    j: ${instruction.instrParameters["J"]},
                                    speed: ${instruction.instrParameters["F"]}`)

        return instruction
    }
}
