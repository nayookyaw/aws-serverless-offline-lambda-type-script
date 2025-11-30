import axios, { AxiosInstance } from "axios";

export interface AuthResult {
    cookieHeader: string;
}

export class ApiClient {
    private client: AxiosInstance;

    constructor(baseUrl: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            // for serverless-offline, http only, no special https config
            withCredentials: true
        });
    }

    /**
     * Authenticate and return the cookie from Set-Cookie header.
    */
    async authenticate(username: string, password: string): Promise<AuthResult> {
        const response = await this.client.post("/auth/login", {
            username,
            password
        });

        const setCookie = response.headers["set-cookie"];

        if (!setCookie || setCookie.length === 0) {
            throw new Error("No Set-Cookie header received from auth endpoint");
        }

        // For simplicity, take the first cookie
        return {
            cookieHeader: setCookie[0]
        };
    }

    /**
     * Call a protected endpoint using a cookie-based token.
    */
    async getProtectedData(cookieHeader: string): Promise<unknown> {
        const response = await this.client.get("/secure/data", {
            headers: {
                Cookie: cookieHeader
            }
        });

        return response?.data;
    }
}
