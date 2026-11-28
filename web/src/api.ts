import { hc } from "hono/client";
import type { AppType } from "../../server/src/app";
import { ACCESS_KEY_HEADER, accessKey } from "./accessKey";

export const client = hc<AppType>("/", {
	headers: () => ({ [ACCESS_KEY_HEADER]: accessKey.get() ?? "" }),
	// A 401 means the stored key is wrong, so drop it and ask again.
	fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
		const res = await fetch(input, init);
		if (res.status === 401) accessKey.clear();
		return res;
	},
});
