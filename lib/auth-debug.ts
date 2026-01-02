let _lastAuthResponseHeaders: Record<string, string> | null = null;
let _lastAuthRequestHeaders: Record<string, string> | null = null;

export function setLastAuthResponseHeaders(headers: Record<string, string>) {
	_lastAuthResponseHeaders = headers;
}

export function getLastAuthResponseHeaders() {
	return _lastAuthResponseHeaders;
}

export function clearLastAuthResponseHeaders() {
	_lastAuthResponseHeaders = null;
}

export function setLastAuthRequestHeaders(headers: Record<string, string>) {
	_lastAuthRequestHeaders = headers;
}

export function getLastAuthRequestHeaders() {
	return _lastAuthRequestHeaders;
}

export function clearLastAuthRequestHeaders() {
	_lastAuthRequestHeaders = null;
}

export function clearAllAuthDebug() {
	_lastAuthRequestHeaders = null;
	_lastAuthResponseHeaders = null;
}
