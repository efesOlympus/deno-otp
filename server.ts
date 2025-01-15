import {
  createTimeBasedOTP,
} from "https://deno.land/x/dotp@v0.0.2/mod.ts";

/**
 * Generates the current OTP (One-Time Password) based on the provided secret key.
 *
 * @param {string} secret - The secret key used for TOTP generation.
 * @returns {string} The current OTP as a string.
 * @throws {Error} If the secret key is empty or OTP generation fails.
 */
export function generateCurrentOtp(secret: string): string {
  if (!secret) {
    const errorMessage = "The secret key must not be empty.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    // Generate the current OTP
    const otp = createTimeBasedOTP(secret);
    console.info("OTP generated successfully.");
    return otp;
  } catch (error) {
    const errorMessage = `Failed to generate OTP: ${error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// HTTP handler for Deno Deploy
addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const secret = url.searchParams.get("key");

  if (!secret) {
    event.respondWith(
      new Response("Missing 'key' query parameter.", { status: 400 })
    );
    return;
  }

  try {
    const otp = generateCurrentOtp(secret);
    event.respondWith(
      new Response(JSON.stringify({ otp }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    event.respondWith(
      new Response(error.message, { status: 500 })
    );
  }
});
