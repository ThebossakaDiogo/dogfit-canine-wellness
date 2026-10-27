import { describe, expect, it } from "vitest";
import { canAccessApp, RESEND_COOLDOWN_SECONDS, MIN_PASSWORD_LENGTH } from "@/lib/auth";

describe("DogFit auth rules", () => {
  it("blocks users whose email is not confirmed", () => {
    expect(canAccessApp({ email_confirmed_at: undefined })).toBe(false);
  });
  it("allows users with confirmed email", () => {
    expect(canAccessApp({ email_confirmed_at: "2026-10-27T00:00:00Z" })).toBe(true);
  });
  it("resend cooldown is 60 seconds", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
  });
  it("password minimum is 8", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
  });
});
