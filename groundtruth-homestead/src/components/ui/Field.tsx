"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

const labelCls = "block text-sm font-medium text-bark-800 mb-1";
const helpCls = "text-xs text-bark-700 mt-1";
const inputCls =
  "w-full rounded-md border border-bark-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-moss-700 focus:ring-1 focus:ring-moss-500";

export function TextField({
  label,
  help,
  ...props
}: { label: string; help?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input {...props} className={`${inputCls} ${props.className ?? ""}`} />
      {help && <span className={helpCls}>{help}</span>}
    </label>
  );
}

export function NumberField({
  label,
  help,
  ...props
}: { label: string; help?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        {...props}
        className={`${inputCls} ${props.className ?? ""}`}
      />
      {help && <span className={helpCls}>{help}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  help,
  ...props
}: { label: string; help?: ReactNode } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea
        rows={3}
        {...props}
        className={`${inputCls} ${props.className ?? ""}`}
      />
      {help && <span className={helpCls}>{help}</span>}
    </label>
  );
}

export function SelectField({
  label,
  help,
  options,
  ...props
}: {
  label: string;
  help?: ReactNode;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <select {...props} className={`${inputCls} ${props.className ?? ""}`}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {help && <span className={helpCls}>{help}</span>}
    </label>
  );
}

export function CheckboxField({
  label,
  help,
  ...props
}: { label: string; help?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-start gap-2 py-1">
      <input
        type="checkbox"
        {...props}
        className="mt-1 h-4 w-4 rounded border-bark-300 text-moss-700 focus:ring-moss-500"
      />
      <span>
        <span className="block text-sm font-medium text-bark-800">{label}</span>
        {help && <span className={helpCls}>{help}</span>}
      </span>
    </label>
  );
}
