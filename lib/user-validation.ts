export type UserInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  branchId?: unknown;
  till?: unknown;
  status?: unknown;
};

type UserValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        name: string;
        email: string;
        phone: string;
        role: string;
        branchId: string | null;
        status: string;
      };
    };

const roles = new Set(["Business Owner", "Branch Manager", "Cashier", "Stock Clerk", "Accountant", "Waiter", "Support Staff"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function userData(input: UserInput): UserValidationResult {
  const errors: string[] = [];
  const email = text(input.email).toLowerCase();
  const phone = text(input.phone);
  const role = text(input.role);

  if (!text(input.name)) errors.push("Full name is required.");
  if (!email) errors.push("Email is required.");
  if (email && !emailPattern.test(email)) errors.push("Email format is invalid.");
  if (!roles.has(role)) errors.push("Role is required.");
  if (phone && phone.length < 4) errors.push("Phone number is too short.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      name: text(input.name),
      email,
      phone,
      role,
      branchId: text(input.branchId) || null,
      status: text(input.status).toLowerCase() === "inactive" ? "Inactive" : "Active",
    },
  };
}
