import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ApiClient } from "./apiClient";

const apiBaseUrl = process.env.API_BASE_URL ?? "";
const authPath = process.env.AUTH_PATH ?? "";
const dataPath = process.env.DATA_PATH ?? "";

// Helper to build a typed client with dynamic paths
function createClient() {
    const client = new ApiClient(apiBaseUrl);

    // Monkeypatch paths at runtime if needed
    (client as any).authPath = authPath;
    (client as any).dataPath = dataPath;

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
        const { cookieHeader } = await client.authenticate(username, password);

        // 2) Use cookie to call protected resource
        const data = await client.getProtectedData(cookieHeader);

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
