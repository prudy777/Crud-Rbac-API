-- User <-> Role join
CREATE TABLE IF NOT EXISTS "UserRole" (
  "userId" INTEGER NOT NULL,
  "roleId" INTEGER NOT NULL,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId"),
  CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "UserRole_roleId_userId_idx" ON "UserRole" ("roleId","userId");

-- Role <-> Permission join
CREATE TABLE IF NOT EXISTS "RolePermission" (
  "roleId" INTEGER NOT NULL,
  "permissionId" INTEGER NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId"),
  CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_roleId_idx" ON "RolePermission" ("permissionId","roleId");
