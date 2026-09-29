/**
 * Base HTTP Client for PAGAR Digital Silat
 * Provides structured, typed request methods with error handling
 */

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown;
    const responseBody = await response.text();
    try {
      errorData = JSON.parse(responseBody);
    } catch {
      errorData = responseBody;
    }
    const responseMessage = typeof errorData === "string"
      ? errorData.trim()
      : typeof errorData === "object" && errorData !== null && "error" in errorData && typeof errorData.error === "string"
        ? errorData.error
        : typeof errorData === "object" && errorData !== null && "message" in errorData && typeof errorData.message === "string"
          ? errorData.message
          : "";
    const message = responseMessage || `Request to ${endpoint} failed with status ${response.status}`;
    throw new ApiError(
      message,
      response.status,
      errorData
    );
  }

  return response.json() as Promise<T>;
}

export const http = {
  get<T>(url: string, options?: RequestInit): Promise<T> {
    return request<T>(url, { ...options, method: "GET" });
  },

  post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string, options?: RequestInit): Promise<T> {
    return request<T>(url, { ...options, method: "DELETE" });
  },
};
