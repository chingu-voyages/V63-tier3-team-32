const STORAGE_KEY = "accessKey";
export const ACCESS_KEY_HEADER = "X-Access-Key";
export const ACCESS_KEY_CLEARED = "access-key-cleared";

export const accessKey = {
	get: () => sessionStorage.getItem(STORAGE_KEY),
	set: (value: string) => sessionStorage.setItem(STORAGE_KEY, value),
	clear: () => {
		sessionStorage.removeItem(STORAGE_KEY);
		window.dispatchEvent(new Event(ACCESS_KEY_CLEARED));
	},
};
