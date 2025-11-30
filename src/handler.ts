import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ApiClient } from "./apiClient";

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const AUTH_PATH = process.env.AUTH_PATH ?? "";
const DATA_PATH = process.env.DATA_PATH ?? "";

// Helper to build a typed client with dynamic paths
function createClient() {
    const client = new ApiClient(API_BASE_URL);
    return client;
}

export const integrate = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    try {
        // In a real scenario, these could come from env vars or request body
        const username = process.env.API_USERNAME ?? "";
        const password = process.env.API_PASSWORD ?? "";

        const client = createClient();

        // 1) Authenticate, get cookie
        const { cookieHeader } = await client.authenticate(username, password, AUTH_PATH);

        // 2) Use cookie to call protected resource
        const data = await client.getProtectedData(cookieHeader, DATA_PATH);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Integration successful",
                cookieUsed: true,
                data
            })
        };
    } catch (error: any) {
        console.error("Error in integrate handler:", error);

        return {
            statusCode: error?.status || 500,
            body: JSON.stringify({
                message: "Integration failed",
                error: error.message ?? "Unknown error"
            })
        };
    }
};
