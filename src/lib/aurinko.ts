"use server";

// misc imports
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

// env vars
const { AURINKO_CLIENT_ID, NEXT_PUBLIC_URL, AURINKO_CLIENT_SECRET } =
  process.env;

/**
 * Generates an authentication URL for Aurinko email service integration
 *
 * @param serviceType - The email service provider to authenticate with ('Google' or 'Office365')
 * @returns Promise resolving to the complete Aurinko authorization URL
 * @throws {Error} When user is not authenticated
 *
 * @example
 * ```typescript
 * const authUrl = await getAurinkoAuthUrl('Google');
 * // Returns: https://api.aurinko.io/v1/auth/authorize?...
 * ```
 */
export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const params = new URLSearchParams({
    clientId: AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

/**
 * Exchanges an authorization code for an access token using the Aurinko API.
 *
 * @param code - The authorization code to exchange for an access token
 * @returns Promise that resolves to an object containing the account ID and access token
 * @throws {AxiosError} When the API request fails
 *
 */
export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: AURINKO_CLIENT_ID as string,
          password: AURINKO_CLIENT_SECRET as string,
        },
      },
    );
    return response.data as {
      accountId: number;
      accessToken: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data);
    }
    console.error(error);
  }
};

/**
 * Retrieves account details from the Aurinko API.
 *
 * @param token - The bearer token used for authentication
 * @returns Promise that resolves to an object containing account details:
 *          - email: The account email address
 *          - name: The account holder's name
 *          - id: The unique account identifier
 * @throws {AxiosError} When the API request fails
 *
 */
export const getAccountDetails = async (token: string) => {
  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data as {
      email: string;
      name: string;
      id: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data);
    }
    console.error(error);
  }
};
