import { exec } from "./exec";

let _registry: string;

async function getRegistry(packageManager: string): Promise<string> {
	if (_registry) return _registry;
	const fallback = "https://registry.npmjs.org";
	try {
		const stdout = await exec(packageManager, ["config", "get", "registry"]);
		_registry = stdout?.trim()?.replace(/\/$/, "") || fallback;
		if (!new URL(_registry).host) _registry = fallback;
	} catch {
		_registry = fallback;
	}
	return _registry;
}

export const getVersion = async (
	packageManager: string,
	packageName: string,
	packageTag = "latest",
	fallback = "",
): Promise<string> => {
	const registry = await getRegistry(packageManager);
	try {
		const response = await fetch(`${registry}/${packageName}/${packageTag}`, {
			redirect: "follow",
		});
		const data = (await response.json()) as { version?: string };
		return data.version ?? fallback;
	} catch {
		return fallback;
	}
};
