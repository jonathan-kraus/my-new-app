let _lastAuthHeaders: Record<string, string> | null = null;

export function setLastAuthHeaders(headers: Record<string, string>) {
	_lastAuthHeaders = headers;
}

export function getLastAuthHeaders() {
	return _lastAuthHeaders;
}

export function clearLastAuthHeaders() {
	_lastAuthHeaders = null;
}
