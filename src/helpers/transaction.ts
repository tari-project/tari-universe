import { TransactionStatus } from "@tari-project/tarijs"
import { CallFunction, CallMethod } from "@tari-project/tarijs/dist/builders/types/Instruction"

interface InstructionWithArgs {
  instructionName: string
  args: any[]
}

export function getFunctionOrMethod(instructions: object[]): InstructionWithArgs[] {
  let functionNames: InstructionWithArgs[] = []
  instructions.forEach((instruction) => {
    if (typeof instruction === "object" && instruction !== null) {
      if ("CallFunction" in instruction) {
        const callFunction = instruction as CallFunction
        functionNames.push({
          instructionName: callFunction.CallFunction.function,
          args: callFunction.CallFunction.args,
        })
      } else if ("CallMethod" in instruction) {
        const callMethod = instruction as CallMethod
        functionNames.push({ instructionName: callMethod.CallMethod.method, args: callMethod.CallMethod.args })
      }
    }
  })
  return functionNames
}

export function getTransactionStatusName(status?: TransactionStatus): string {
  if (!status) return ""
  return TransactionStatus[status]
}
