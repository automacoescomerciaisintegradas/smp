import assert from "node:assert/strict";
import test from "node:test";

import { PrismaClient } from "@prisma/client";

test("mongodb prisma client can be constructed without adapter config", () => {
  assert.doesNotThrow(() => {
    const prisma = new PrismaClient({});
    void prisma;
  });
});
