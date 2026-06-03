export type BranchInput = {
  name?: unknown;
  location?: unknown;
  phone?: unknown;
  managerName?: unknown;
  status?: unknown;
  notes?: unknown;
};

type BranchValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        name: string;
        location: string;
        phone: string;
        managerName: string;
        status: string;
      };
    };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function branchData(input: BranchInput): BranchValidationResult {
  const errors: string[] = [];
  const phone = text(input.phone);

  if (!text(input.name)) errors.push("Branch name is required.");
  if (!text(input.location)) errors.push("Location is required.");
  if (phone && phone.length < 4) errors.push("Phone number is too short.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      name: text(input.name),
      location: text(input.location),
      phone,
      managerName: text(input.managerName) || "Not assigned",
      status: text(input.status).toLowerCase() === "inactive" ? "Inactive" : "Active",
    },
  };
}
