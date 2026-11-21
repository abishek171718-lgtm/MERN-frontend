import bcrypt from "bcryptjs";
import { readStoredValue, USER_KEY, writeStoredValue } from "./storage";

export const USERS_KEY = "toyworld-users";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordByteLimit = 72;

function readUsers() {
  const users = readStoredValue(USERS_KEY, []);
  if (!Array.isArray(users) || !users.every((user) =>
    user &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.passwordHash === "string"
  )) {
    throw new Error(`Saved account data is invalid. Remove the "${USERS_KEY}" localStorage item and reload.`);
  }
  return users;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function saveSession(user) {
  const result = publicUser(user);
  writeStoredValue(USER_KEY, result);
  return result;
}

export async function authRequest(path, body) {
  if (path === "register") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2 || name.length > 100) {
      throw new Error("Enter a name between 2 and 100 characters.");
    }
    if (!emailPattern.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    if (password.length < 6 || new TextEncoder().encode(password).length > passwordByteLimit) {
      throw new Error("Password must be 6 characters or more and no more than 72 UTF-8 bytes.");
    }

    const users = readUsers();
    if (users.some((user) => user.email === email)) {
      throw new Error("An account with this email already exists.");
    }

    const user = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    };
    writeStoredValue(USERS_KEY, [...users, user]);
    return saveSession(user);
  }

  if (path === "login") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!emailPattern.test(email) || password.length === 0 || new TextEncoder().encode(password).length > passwordByteLimit) {
      throw new Error("Enter a valid email address and password.");
    }

    const user = readUsers().find((entry) => entry.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error("Email or password is incorrect.");
    }
    return saveSession(user);
  }

  throw new Error("Unsupported authentication action.");
}
