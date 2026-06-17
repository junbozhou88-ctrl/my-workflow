const STORAGE_KEY = "tennis-ticket-user-id";

/**
 * 当前浏览器用户标识（本版本无登录）。首次访问生成 UUID 并持久化到
 * localStorage，刷新后保持不变；不同浏览器/设备天然隔离。
 */
export function getClientUserId(): string {
	if (typeof window === "undefined") {
		return "";
	}
	let id = window.localStorage.getItem(STORAGE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		window.localStorage.setItem(STORAGE_KEY, id);
	}
	return id;
}
