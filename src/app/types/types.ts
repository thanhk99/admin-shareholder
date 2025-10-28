import { ReactNode } from "react";

// types.ts
export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  children?: MenuItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}