import { APIGatewayProxyEventV2 } from "aws-lambda";
import { integrate } from "../src/handler";
import { ApiClient } from "../src/apiClient";

describe("integrate handler,  unit test", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetAllMocks();
        process.env = { ...OLD_ENV };
        process.env.API_BASE_URL = "";
        process.env.AUTH_PATH = "/auth/login";
        process.env.DATA_PATH = "";
        process.env.API_USERNAME = "test-user";
        process.env.API_PASSWORD = "test-pass";
    });

    afterAll(()=> {
        process.env = OLD_ENV;
    });

    const makeEvent = () : APIGatewayProxyEventV2 => ({
        version: "2.0",
        routeKey: "$default",
        rawPath: "/",
        rawQueryString: "",
        headers: {},
        requestContext: {} as any,
        isBase64Encoded: false,
    });

    test ("test cookies and return data", async() => {
        // Arrange
        const authenticateMock = jest
        .spyOn(ApiClient.prototype, "authenticate")
        .mockResolvedValue({
            cookieHeader: "session=abc123;",
        });

        const getProtectedDataMock = jest
        .spyOn(ApiClient.prototype, "getProtectedData")
        .mockResolvedValue({
            id: 1,
            name: "Test Data",
        });


        // Act
        const result = await integrate(makeEvent());

        // Assert
        expect(authenticateMock).toHaveBeenCalledWith(
            "test-user",
            "test-pass",
            "/auth/login"
        );

        expect(getProtectedDataMock).toHaveBeenCalledWith(
            "session=abc123;",
            "/secure/data"
        );

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body ?? "{}");
        expect(body.message).toBe("Integration successful");
        expect(body.cookieUsed).toBe(true);
        expect(body.data).toEqual({ id: 1, name: "Test Data" });
    });
});