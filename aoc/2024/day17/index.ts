type Registers = Map<"A" | "B" | "C", number>;

type Instruction = (
	registers: Registers,
	operand: number,
) => { registers: Registers; nextPointer?: number; output?: number };

const combos: { [key: number]: number | "A" | "B" | "C" } = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: "A",
	5: "B",
	6: "C",
};

function getComboValue(registers: Registers, operand: number): number {
	const combo = combos[operand];
	return typeof combo === "string"
		? registers.get(combo as "A" | "B" | "C") || 0
		: combo;
}

function parse(input: string): [Registers, number[]] {
	const [A, B, C, _, raw] = input.trim().split("\n");
	const registers: Registers = new Map([
		["A", Number(A.split(":")[1].trim())],
		["B", Number(B.split(":")[1].trim())],
		["C", Number(C.split(":")[1].trim())],
	]);
	const program = raw.split(":")[1].trim().split(",").map(Number);
	return [registers, program];
}

const createDivInstruction =
	(target: "A" | "B" | "C"): Instruction =>
	(registers: Registers, operand: number) => {
		const numerator = registers.get("A") || 0;
		const denominator = 2 ** getComboValue(registers, operand);
		registers.set(target, Math.floor(numerator / denominator));
		return { registers };
	};

const adv = createDivInstruction("A");
const bdv = createDivInstruction("B");
const cdv = createDivInstruction("C");

const bxl: Instruction = (registers: Registers, operand: number) => {
	const B = registers.get("B") || 0;
	registers.set("B", B ^ operand);
	return { registers };
};

const bst: Instruction = (registers: Registers, operand: number) => {
	const combo = combos[operand];
	let value: number;
	if (typeof combo === "string") {
		value = registers.get(combo as "A" | "B" | "C") || 0;
	} else {
		value = combo;
	}
	registers.set("B", value % 8);
	return { registers };
};

const jnz: Instruction = (registers: Registers, operand: number) => {
	if (registers.get("A") !== 0) {
		return { registers, nextPointer: operand };
	}
	return { registers };
};

const bxc: Instruction = (registers: Registers, _operand: number) => {
	const B = registers.get("B") || 0;
	const C = registers.get("C") || 0;

	registers.set("B", B ^ C);
	return { registers };
};

const out: Instruction = (registers: Registers, operand: number) => {
	const combo = combos[operand];
	let value: number;
	if (typeof combo === "string") {
		value = registers.get(combo as "A" | "B" | "C") || 0;
	} else {
		value = combo;
	}

	return { registers, output: value % 8 };
};

const opcodes: { [key: number]: Instruction } = {
	0: adv,
	1: bxl,
	2: bst,
	3: jnz,
	4: bxc,
	5: out,
	6: bdv,
	7: cdv,
};

function runProgram(
	program: number[],
	registers: Registers,
	_returnReg = false,
): number[] {
	let currentRegisters = registers;
	let pointer = 0;
	const outputs: number[] = [];

	while (pointer < program.length) {
		const opcode = program[pointer];
		const operand = program[pointer + 1];
		const fn = opcodes[opcode as keyof typeof opcodes];
		const {
			registers: updatedRegisters,
			nextPointer,
			output,
		} = fn(currentRegisters, operand);
		currentRegisters = updatedRegisters;

		if (output !== undefined) {
			outputs.push(output);
		}
		if (nextPointer !== undefined) {
			pointer = nextPointer;
		} else {
			pointer += 2;
		}
	}

	return outputs;
}

function part1(input: string): number | string {
	const [registers, program] = parse(input);
	return runProgram(program, registers).join(",");
}

function part2(input: string): number | string {
	const [registers, program] = parse(input);
	return runProgram(program, registers).join(",");
}

export default { p1: part1, p2: part2 };
