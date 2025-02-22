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

    // Enforce POST method
    if (method !== "POST") {
      event.respondWith(new Response("Method Not Allowed", { status: 405 }));
      return;
    }

    // Retrieve the secret authorization key from Deno Deploy environment
    const expectedAuthKey = Deno.env.get("authKey");
    if (!expectedAuthKey) {
      console.error("Authorization key not set in environment variables.");
      event.respondWith(new Response("Server Configuration Error", { status: 500 }));
      return;
    }

    // Validate Authorization header
    const authHeader = event.request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${expectedAuthKey}`) {
      event.respondWith(new Response("Unauthorized", { status: 401 }));
      return;
    }

    const body = await event.request.json();
    const secret = body.key;

    // Validate the secret
    if (!secret || !/^[A-Z2-7]+=*$/.test(secret)) {
      event.respondWith(
        new Response("Invalid or missing 'key' in request body.", { status: 400 })
      );
      return;
    }

    const otpCode = await generateCurrentOtp(secret);

    // Respond with the OTP
    event.respondWith(
      new Response(JSON.stringify({ otp: otpCode.replace(/\s+/g, "") }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  } catch (error) {
    event.respondWith(new Response("Internal Server Error", { status: 500 }));
  }
});
