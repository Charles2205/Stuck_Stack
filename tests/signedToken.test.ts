import { describe, expect, it } from "vitest";
import { createToken, verifyToken } from "@/lib/signedToken";

describe("signed session token", () => {
  it("round-trips a valid token", () => {
    const token = createToken("cmq9wfn9m0000lp94ng3fnh7i");
    expect(verifyToken(token)).toBe("cmq9wfn9m0000lp94ng3fnh7i");
  });

  it("rejects a tampered signature", () => {
    const token = createToken("some-id");
    expect(verifyToken(`some-id.${"x".repeat(43)}`)).toBeNull();
    expect(verifyToken(token.slice(0, -1) + "!")).toBeNull();
  });

  it("rejects a swapped id with a foreign signature", () => {
    const token = createToken("organizer-a");
    const signature = token.slice(token.lastIndexOf(".") + 1);
    expect(verifyToken(`organizer-b.${signature}`)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("no-dot-here")).toBeNull();
    expect(verifyToken(".starts-with-dot")).toBeNull();
    expect(verifyToken("id.")).toBeNull();
  });
});
