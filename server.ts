import { totp } from "https://deno.land/x/otplib@12.0.1/mod.ts";

/**
 * Generates the current OTP (One-Time Password) based on the provided secret key.
 *
 * @param {string} secret - The secret key used for TOTP generation.
 * @param {Console} [logger] - A logger instance for logging messages and errors.
 * @returns {string} The current OTP as a string.
 * @throws {Error} If the secret key is empty or OTP generation fails.
 */
export function generateCurrentOtp(secret, logger = console) {
  if (!secret) {
    const errorMessage = "The secret key must not be empty.";
    if (logger) {
      logger.error(errorMessage);
    }
    throw new Error(errorMessage);
  }

  try {
    // Generate the current OTP
    const otp = totp.generate(secret);
    if (logger) {
      logger.info("OTP generated successfully.");
    }
    return otp;
  } catch (error) {
    const errorMessage = `Failed to generate OTP: ${error.message}`;
    if (logger) {
      logger.error(errorMessage);
    }
    throw new Error(errorMessage);
  }
}

// HTTP handler for Deno Deploy
addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const secret = url.searchParams.get("key");

  try {
    if (!secret) {
      return event.respondWith(
        new Response("Missing 'key' query parameter.", { status: 400 })
      );
    }

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
