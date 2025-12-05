export function normalizeRemoteError(err: unknown): RemotePayload {
  try {
    const anyErr: any = err ?? {};

    // Caso 1: error ya estructurado (lo usual en un RpcException)
    if (typeof anyErr === 'object' && anyErr !== null) {
      const status =
        anyErr.status ??
        anyErr.statusCode ??
        anyErr.response?.status ??
        undefined;

      const message =
        anyErr.message ??
        anyErr.error ??
        anyErr.response?.message ??
        'Unknown remote error';

      const details =
        anyErr.details ??
        anyErr.response?.details ??
        null;

      return { status, message, details };
    }

    // Caso 2: si el error es un string → intentar parseo
    if (typeof err === 'string') {
      const trimmed = err.trim();

      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        const parsed = JSON.parse(trimmed);

        return {
          status: parsed.status ?? parsed.statusCode ?? undefined,
          message: parsed.message ?? parsed.error ?? trimmed,
          details: parsed.details ?? null,
        };
      }

      return { message: trimmed };
    }

    // Caso 3: fallback
    return { message: 'Unknown remote error' };
  } catch {
    return { message: 'Unknown remote error' };
  }
}
