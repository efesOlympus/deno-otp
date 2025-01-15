import { Totp, TotpOptions } from "https://deno.land/x/otp@0.3.0/totp.ts";

/**
 * Generates the current OTP (One-Time Password) based on the provided secret key.
 *
 * @param {string} secret - The secret key used for TOTP generation.
 * @returns {Promise<string>} The current OTP as a string.
 * @throws {Error} If the secret key is empty or OTP generation fails.
 */
export async function generateCurrentOtp(secret: string): Promise<string> {
  if (!secret) {
    const errorMessage = "The secret key must not be empty.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const totpOptions: TotpOptions = {
      stepSize: 30, // 30-second time step, standard for TOTP
    };
    const totpInstance = new Totp(secret, totpOptions);

    // Generate the current OTP
    const otpCode = await totpInstance.generate();
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

    const otpCode = await generateCurrentOtp(secret);
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
