import * as otp from "https://deno.land/x/otp@0.3.0/mod.ts";

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
    const otpCode = otp.TOTP.generate(secret);
    console.info(`OTP generated successfully: ${otpCode}`);
    return otpCode;
  } catch (error) {
    const errorMessage = `Failed to generate OTP: ${error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// HTTP handler for Deno Deploy
addEventListener("fetch", async (event) => {
  try {
    const { method } = event.request;

    if (method !== "POST") {
      event.respondWith(
        new Response("Method Not Allowed", { status: 405 })
      );
      return;
    }

    const body = await event.request.json();
    const secret = body.key;

    if (!secret) {
      event.respondWith(
        new Response("Missing 'key' in request body.", { status: 400 })
      );
      return;
    }

    const otpCode = generateCurrentOtp(secret);
    event.respondWith(
      new Response(JSON.stringify({ otp: otpCode }), {
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
