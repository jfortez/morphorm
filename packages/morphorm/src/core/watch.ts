// oxlint-disable typescript/no-explicit-any

export type WatchDependencyMap = Record<string, string[]>;

const normalizePathSegments = (path: string): string[] => {
	return path
		.replace(/\[(\d+)\]/g, ".$1")
		.split(".")
		.filter(Boolean);
};

export const getValueByPath = (
	source: Record<string, unknown> | undefined,
	path: string,
): unknown => {
	if (!source) {
		return undefined;
	}

	const segments = normalizePathSegments(path);
	let current: unknown = source;

	for (const segment of segments) {
		if (current === null || typeof current !== "object") {
			return undefined;
		}
		current = (current as Record<string, unknown>)[segment];
	}

	return current;
};

export const setValueByPath = (
	target: Record<string, unknown>,
	path: string,
	value: unknown,
): Record<string, unknown> => {
	const segments = normalizePathSegments(path);
	if (segments.length === 0) {
		return target;
	}

	let current: Record<string, unknown> = target;
	for (let index = 0; index < segments.length - 1; index++) {
		const segment = segments[index]!;
		const next = current[segment];
		if (!next || typeof next !== "object") {
			current[segment] = {};
		}
		current = current[segment] as Record<string, unknown>;
	}

	current[segments[segments.length - 1]!] = value;
	return target;
};

export const resolveWatchPathForField = (watchPath: string, fieldPath: string): string => {
	const fieldMatch = /^([^[.\]]+)\[(\d+)\]/.exec(fieldPath);
	if (!fieldMatch || watchPath.includes("[")) {
		return watchPath;
	}

	const arrayRoot = fieldMatch[1]!;
	const arrayIndex = fieldMatch[2]!;
	if (watchPath === arrayRoot) {
		return `${arrayRoot}[${arrayIndex}]`;
	}
	if (watchPath.startsWith(`${arrayRoot}.`)) {
		return `${arrayRoot}[${arrayIndex}]${watchPath.slice(arrayRoot.length)}`;
	}

	return watchPath;
};

export const createWatchDependencyMap = (
	watchKeys: string[],
	fieldPath: string,
): WatchDependencyMap => {
	const dependencyMap: WatchDependencyMap = {};
	for (const key of watchKeys) {
		dependencyMap[key] = [resolveWatchPathForField(key, fieldPath)];
	}
	return dependencyMap;
};

export const createStableWatchSelector = (watchKeys: string[], fieldPath: string) => {
	let prevResult: Record<string, unknown> | null = null;
	let prevValues: unknown[] | null = null;
	const dependencies = createWatchDependencyMap(watchKeys, fieldPath);

	return (state: any) => {
		const nextValues = watchKeys.map((key) => {
			const resolvedPath = dependencies[key]![0]!;
			return getValueByPath(state.values, resolvedPath);
		});

		if (
			prevResult &&
			prevValues &&
			nextValues.length === prevValues.length &&
			nextValues.every((value, index) => Object.is(value, prevValues![index]))
		) {
			return prevResult;
		}

		const nextResult: Record<string, unknown> = {};
		watchKeys.forEach((key, index) => {
			setValueByPath(nextResult, key, nextValues[index]);
		});

		prevValues = nextValues;
		prevResult = nextResult;
		return nextResult;
	};
};
