import { describe, it, expect } from "vitest";
import { parseUid } from "../contexts/SerialContext";

describe("parseUid", () => {
    it("should parse standard hex UID", () => {
        expect(parseUid("2B375006")).toBe("2B375006");
    });

    it("should parse UID with tag prefix", () => {
        expect(parseUid("UID tag :822CE4BC")).toBe("822CE4BC");
    });

    it("should parse UID with spaces in tag prefix", () => {
        expect(parseUid("  UID tag : 82 2C E4 BC")).toBe("822CE4BC");
    });

    it("should handle lowercase hex", () => {
        expect(parseUid("uid tag :822ce4bc")).toBe("822CE4BC");
    });

    it("should return null for non-hex strings", () => {
        expect(parseUid("hello world")).toBe(null);
    });

    it("should handle mixed content around hex", () => {
        expect(parseUid("Card detected! ID: 1234ABCD, status OK")).toBe("1234ABCD");
    });

    it("should handle 10-character hex", () => {
        expect(parseUid("0102030405")).toBe("0102030405");
    });
});
