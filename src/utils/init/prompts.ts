import path from "node:path";
import { confirm, isCancel, password, select, text } from "@clack/prompts";
import { isEmpty } from "./validation";

export interface TextPromptConfig {
	type: "text";
	message: string;
	placeholder?: string;
	validator?: (value: string) => string | undefined;
}

export interface SelectPromptConfig {
	type: "select";
	message: string;
	options: Array<{ value: string; label: string }>;
	initialValue?: string;
}

export interface ConfirmPromptConfig {
	type: "confirm";
	message: string;
	initialValue?: boolean;
}

export interface PasswordPromptConfig {
	type: "password";
	message: string;
}

export type PromptConfig =
	| TextPromptConfig
	| SelectPromptConfig
	| ConfirmPromptConfig
	| PasswordPromptConfig;

/**
 * Show a prompt and return the value.
 * Returns the value if user confirms, calls ctx.exit if cancelled.
 */
export async function showPrompt(
	config: PromptConfig,
	onCancel: () => never,
): Promise<string | boolean> {
	switch (config.type) {
		case "text": {
			const response = await text({
				message: config.message,
				placeholder: config.placeholder,
				initialValue: config.placeholder || "",
				validate: config.validator,
			});
			if (isCancel(response)) onCancel();
			return (response as string).trim();
		}

		case "select": {
			const response = await select({
				message: config.message,
				options: config.options,
				initialValue: config.initialValue,
			});
			if (isCancel(response)) onCancel();
			return response as string;
		}

		case "confirm": {
			const response = await confirm({
				message: config.message,
				initialValue: config.initialValue,
			});
			if (isCancel(response)) onCancel();
			return response as boolean;
		}

		case "password": {
			const response = await password({
				message: config.message,
			});
			if (isCancel(response)) onCancel();
			return (response as string).trim();
		}
	}
}

/**
 * Handle a text prompt with optional validation.
 */
export async function handleTextPrompt(
	config: Omit<TextPromptConfig, "type">,
	defaultValue: string,
	onCancel: () => never,
): Promise<string> {
	const response = await showPrompt(
		{ type: "text", ...config },
		onCancel,
	);
	return (response as string) || defaultValue;
}

/**
 * Handle a select prompt.
 */
export async function handleSelectPrompt(
	config: Omit<SelectPromptConfig, "type">,
	onCancel: () => never,
): Promise<string> {
	return (await showPrompt(
		{ type: "select", ...config },
		onCancel,
	)) as string;
}

/**
 * Handle a confirm prompt.
 */
export async function handleConfirmPrompt(
	config: Omit<ConfirmPromptConfig, "type">,
	onCancel: () => never,
): Promise<boolean> {
	return (await showPrompt(
		{ type: "confirm", ...config },
		onCancel,
	)) as boolean;
}

/**
 * Handle a password prompt.
 */
export async function handlePasswordPrompt(
	message: string,
	onCancel: () => never,
): Promise<string> {
	return (await showPrompt({ type: "password", message }, onCancel)) as string;
}

/**
 * Validators for common input patterns
 */
export const validators = {
	nonEmpty: (value: string) =>
		!value.trim() ? "This field is required." : undefined,

	printable: (value: string) =>
		value.match(/[^\x20-\x7E]/g) !== null
			? "Invalid non-printable character present!"
			: undefined,

	projectName: (value: string): string | undefined => {
		if (!value.trim()) return "Please enter a project name.";
		if (value.match(/[^\x20-\x7E]/g) !== null)
			return "Invalid non-printable character present!";
		return undefined;
	},

	directoryName: (value: string, basePath: string): string | undefined => {
		if (!value) return "Please enter a folder name.";
		const candidate = path.resolve(basePath, value);
		if (!isEmpty(candidate)) return "Directory is not empty!";
		if (value.match(/[^\x20-\x7E]/g) !== null)
			return "Invalid non-printable character present!";
		return undefined;
	},
};
