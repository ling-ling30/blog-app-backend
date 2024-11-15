import * as jose from "jose";

const verifyToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode("JWT_SECRET");
    const { payload, protectedHeader } = await jose.jwtVerify(token, secret);

    return payload.user;
  } catch (error: any) {
    if (error instanceof jose.errors.JOSEError) {
      if (error.code === "ERR_JWT_INVALID") {
        throw new Error("Invalid token!");
      }
      if (error.code === "ERR_JWT_EXPIRED") {
        throw new Error("Token expired!");
      }
    }

    console.error("Verify token failed", error);
    throw error;
  }
};

export { verifyToken };
