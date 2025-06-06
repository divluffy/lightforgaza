// src/lib/types.ts

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  // يمكنك إضافة حقول أخرى مثل: image، createdAt، ...
}
