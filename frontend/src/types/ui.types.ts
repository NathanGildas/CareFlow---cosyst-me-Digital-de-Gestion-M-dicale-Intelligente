// src/types/ui.types.ts
import type { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from "react";

// ===== TYPES GÉNÉRIQUES =====

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "light"
  | "dark";
export type ColorScheme =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "gray"
  | "indigo"
  | "pink";

// ===== BUTTON TYPES =====

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// ===== CARD TYPES =====

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated" | "flat";
  padding?: Size;
  children: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}

// ===== MODAL TYPES =====

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
}

// ===== BADGE TYPES =====

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  rounded?: boolean;
  children: ReactNode;
}

// ===== ALERT TYPES =====

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  description?: string;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

// ===== LOADING TYPES =====

export interface LoadingSpinnerProps {
  size?: Size;
  color?: ColorScheme;
  className?: string;
}

export interface LoadingScreenProps {
  message?: string;
  size?: Size;
  fullScreen?: boolean;
}

// ===== NAVIGATION TYPES =====

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  variant?: "fixed" | "sticky" | "floating";
}

export interface HeaderProps {
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
  variant?: "default" | "transparent" | "dark";
}

// ===== FORM TYPES =====

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface SelectProps
  extends Omit<HTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: string;
  size?: Size;
}

// ===== TABLE TYPES =====

export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    selectedRowKeys: (string | number)[];
    onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  };
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
}

// ===== NOTIFICATION TYPES =====

export interface NotificationProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }>;
  onClose?: () => void;
}

// ===== STEP TYPES =====

export interface StepProps {
  title: string;
  description?: string;
  status?: "wait" | "process" | "finish" | "error";
  icon?: ReactNode;
}

export interface StepsProps {
  current: number;
  steps: StepProps[];
  direction?: "horizontal" | "vertical";
  size?: Size;
  onChange?: (current: number) => void;
}

// ===== BREADCRUMB TYPES =====

export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
}

// ===== DROPDOWN TYPES =====

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  children?: DropdownItem[];
}

export interface DropdownProps {
  items: DropdownItem[];
  trigger?: "hover" | "click";
  placement?:
    | "bottom"
    | "bottomLeft"
    | "bottomRight"
    | "top"
    | "topLeft"
    | "topRight";
  disabled?: boolean;
  children: ReactNode;
}

// ===== TOOLTIP TYPES =====

export interface TooltipProps {
  title: string;
  placement?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click" | "focus";
  children: ReactNode;
}

// ===== TABS TYPES =====

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  type?: "line" | "card" | "editable-card";
  size?: Size;
  position?: "top" | "bottom" | "left" | "right";
}

// ===== UTILITY TYPES =====

export interface ComponentSize {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  light: string;
  dark: string;
}

export interface BreakPoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

// Export des constantes utiles
export const COMPONENT_SIZES: ComponentSize = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

export const THEME_COLORS: ThemeColors = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  light: "light",
  dark: "dark",
};
