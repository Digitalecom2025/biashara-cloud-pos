import { ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "success";

type Props =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
  };

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  const variants = {
    primary:
      "bg-green-600 text-white hover:bg-green-700",

    secondary:
      "border bg-white hover:bg-gray-100",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    success:
      "bg-blue-600 text-white hover:bg-blue-700",
  };

  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}