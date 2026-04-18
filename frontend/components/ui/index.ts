// Gamma design system atoms.
// Each atom wraps prototype/_components.css classes (byte-exact via
// scripts/sync-tokens.mjs). Do NOT invent atoms - CLAUDE.md rule 4.

export { Button, type ButtonProps } from "./button";
export { Input, type InputProps } from "./input";
export {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  type CardProps,
} from "./card";
export { Modal, type ModalProps } from "./modal";
export {
  Table,
  DataTableWrapper,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "./table";
export { Select, type SelectProps } from "./select";
export { Checkbox, type CheckboxProps } from "./checkbox";
export { Radio, type RadioProps } from "./radio";
export { Toggle, type ToggleProps } from "./toggle";
export { Textarea, type TextareaProps } from "./textarea";
export { Badge, type BadgeProps } from "./badge";
export { Pill, type PillProps } from "./pill";
export { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { Accordion, AccordionItem } from "./accordion";
export { Drawer, type DrawerProps } from "./drawer";
export { ToastProvider, useToast } from "./toast";
export { Tooltip } from "./tooltip";
export { SearchInput, type SearchInputProps } from "./search-input";
export { Icon, type IconProps, type IconSize } from "./icon";

// New in Phase 4 design review.
export {
  Avatar,
  AvatarGroup,
  type AvatarProps,
  type AvatarSize,
  type AvatarStatus,
} from "./avatar";
export { Skeleton, type SkeletonProps, type SkeletonVariant } from "./skeleton";
export { Spinner, type SpinnerSize } from "./spinner";
export { ProgressBar, type ProgressTone } from "./progress-bar";
export { Pagination, type PaginationProps } from "./pagination";
export { SegControl, type SegOption } from "./seg-control";
export {
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
} from "./dropdown";
