import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldBase {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}
type FieldProps = FieldBase & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">;
export function StudioField({ id, label, value, onChange, hint, error, required, className = "", ...props }: FieldProps) {
  return (
    <div className={`studio-field ${className}`}>
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input {...props} id={id} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        aria-invalid={!!error} aria-describedby={error || hint ? `${id}-hint` : undefined} />
      {(error || hint) && <p id={`${id}-hint`} className={error ? "studio-error-text" : ""}>{error || hint}</p>}
    </div>
  );
}
type AreaProps = FieldBase & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "id">;
export function StudioArea({ id, label, value, onChange, hint, error, required, className = "", ...props }: AreaProps) {
  return (
    <div className={`studio-field ${className}`}>
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <textarea rows={4} {...props} id={id} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        aria-invalid={!!error} aria-describedby={error || hint ? `${id}-hint` : undefined} />
      {(error || hint) && <p id={`${id}-hint`} className={error ? "studio-error-text" : ""}>{error || hint}</p>}
    </div>
  );
}
