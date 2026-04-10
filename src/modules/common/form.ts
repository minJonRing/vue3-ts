import type { FormItemRule } from "element-plus";

export type FormItemType =
  | "input"
  | "select"
  | "input-number"
  | "switch"
  | "cascader"
  | "tree-select"
  | "time-picker"
  | "time-select"
  | "date-picker"
  | "radio"
  | "checkbox"
  | "custom";

export type SelectOption = { label: string; value: unknown; [key: string]: any };

export type CommonFormItem = {
  span?: number;
  type: FormItemType;
  label: string;
  prop: string;
  tips?: string | Record<string, any>;
  placeholder?: string;
  clearable?: boolean;
  options?: Array<SelectOption>;
  attrs?: Record<string, any>;
  events?: Record<string, (...args: any[]) => void>;
  rules?: FormItemRule[];
  initialValue?: any;
  hidden?: boolean;
  slotName?: string;
  style?: Record<string, any>;
};
