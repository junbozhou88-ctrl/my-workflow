export interface Bindings {
	CORS_ORIGIN: string;
	DB: D1Database;
}

export interface Variables {
	userId: string;
}

export interface AppEnv {
	Bindings: Bindings;
	Variables: Variables;
}
