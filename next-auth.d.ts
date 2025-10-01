




// I created this file to define type for User Role in auth.config.ts

import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser{
    id: string;
    role?: "ADMIN" | "CUSTOMER";
  }
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER"; 
    } & DefaultSession["user"];
  }
}


declare module "@auth/core/adapters" {
  interface AdapterUser extends User {
    id: string
    role?: "ADMIN" | "CUSTOMER"
  }
}

