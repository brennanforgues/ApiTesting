import * as http from "k6/http";
import { Params, RequestBody } from "k6/http";

// Verify environment variables
if (!__ENV.FLASH_USERNAME || !__ENV.FLASH_PASSWORD) {
  const errMsg =
    "The FLASH_USERNAME and FLASH_PASSWORD environment variables must be set.\n" +
    "You can set them using the -e flag: k6 run -e FLASH_USERNAME=yourusername -e FLASH_PASSWORD=yourpassword script.js\n" +
    "OR set them in as environment variables, for example: SET FLASH_USERNAME=ajohnson@hoopp.com";
  throw new Error(errMsg);
}

function authUrl(url: string): string {
  const credentials = `${__ENV.FLASH_USERNAME}:${__ENV.FLASH_PASSWORD}@`;

  const idx = url.indexOf("://") + 3;
  const result = url.substring(0, idx) + credentials + url.substring(idx, url.length);
  return result;
}

function enhanceParams(params?: Params | null | undefined): Params {
  const defaultHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  };
  const headers = params && params.headers ? { ...params.headers, ...defaultHeaders } : defaultHeaders;
  return {
    ...params,
    auth: "ntlm",
    headers,
  };
}

function sendRequest<TResponse>(method: string, url: string, body?: any | null, params?: Params | null | undefined): Response<TResponse> {
  let response;
  try {
    params = enhanceParams(params);
    body = typeof body === "object" && body !== null ? JSON.stringify(body) : body;
    console.log(`${method.toUpperCase()} ${url}`, params);
    switch (method) {
      case "get":
        response = http.get(authUrl(url), params);
        break;
      case "post":
        response = http.post(authUrl(url), body, params);
        break;
      case "put":
        response = http.put(authUrl(url), body, params);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    const result = { ...response, body: response.json() as TResponse };
    return result;
  } catch (error: any) {
    error.data = {
      url,
      response,
    };
    throw error;
  }
}

const client = {
  get<TResponse>(url: string, params?: Params | null | undefined): Response<TResponse> {
    return sendRequest<TResponse>("get", url, null, params);
  },
  post<TResponse>(url: string, body?: any | null, params?: Params | null | undefined): Response<TResponse> {
    return sendRequest<TResponse>("post", url, body, params);
  },
  put<TResponse>(url: string, body?: RequestBody | null, params?: Params | null | undefined): Response<TResponse> {
    return sendRequest<TResponse>("put", url, body, params);
  },
};

export interface Response<TBody> extends Omit<http.Response, "body"> {
  body: TBody;
}

export default client;
