import { randomInt } from "crypto";
import { PASSCODE_ALPHABET, PASSCODE_LENGTH } from "./constants";
import { getCollection } from "./mongodb";
import type { TripDocument } from "@/types";

export function generatePasscode(): string {
  let code = "";
  for (let i = 0; i < PASSCODE_LENGTH; i++) {
    code += PASSCODE_ALPHABET[randomInt(PASSCODE_ALPHABET.length)];
  }
  return code;
}

export function validatePasscodeFormat(passcode: string): boolean {
  if (passcode.length !== PASSCODE_LENGTH) return false;
  return passcode.split("").every((c) => PASSCODE_ALPHABET.includes(c));
}

export async function lookupTrip(
  passcode: string
): Promise<TripDocument | null> {
  const collection = await getCollection("trips");
  const doc = await collection.findOne({ passcode: passcode.toUpperCase() });
  return doc as TripDocument | null;
}
