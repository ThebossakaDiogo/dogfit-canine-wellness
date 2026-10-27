import { describe, expect, it } from "vitest";
import { canAccessApp, RESEND_COOLDOWN_SECONDS } from "@/lib/auth";

describe("DogFit auth rules", () => {
  it("blocks users whose email is not confirmed", () => {
    expect(canAccessApp({})).toBe(false);
  });
  it("allows users with confirmed email", () => {
    expect(canAccessApp({ email_confirmed_at: "2026-10-27T00:00:00Z" })).toBe(true);
  });
  it("resend cooldown is 60 seconds", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
  });
});
