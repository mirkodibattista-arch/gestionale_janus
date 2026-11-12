import type { InputHTMLAttributes } from "react";

export function Field({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="field-wrap">
      <span>{label}</span>
      <input id={id} className="field" {...props} />
    </label>
  );
}
