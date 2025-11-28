-- AlterTable: Make password optional and add googleId for OAuth support
ALTER TABLE "users" 
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- CreateIndex: Ensure googleId is unique
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" ON "users"("googleId");


