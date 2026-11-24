import { exec } from "./exec";

let _registryPromise: Promise<string> | undefined;

async function getRegistry(packageManager: string): Promise<string> {
	if (_registryPromise) return _registryPromise;
	const fallback = "https://registry.npmjs.org";
	_registryPromise = (async () => {
		try {
			const stdout = await exec(packageManager, ["config", "get", "registry"]);
			const registry = stdout?.trim()?.replace(/\/$/, "") || fallback;
			if (!new URL(registry).host) return fallback;
			return registry;
		} catch {
			return fallback;
		}
	})();
	return _registryPromise;
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
