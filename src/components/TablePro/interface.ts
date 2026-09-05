import type { FormInstance, TableProps } from "antd";
import type { ColumnType } from "antd/es/table";
import type { ReactNode } from "react";

/** TablePro 搜索栅格使用的响应式断点。 */
export type TableProBreakpoint = "xs" | "sm" | "md" | "lg" | "xl";

/** 单个断点下搜索项占用的网格列数与偏移。 */
export interface TableProResponsive {
	span?: number;
	offset?: number;
}

/** TablePro 内置支持的搜索控件类型。 */
export type TableProSearchType = "input" | "input-number" | "select" | "date-picker" | "date-range";

/** 自定义搜索控件能够访问的表单上下文。 */
export interface TableProSearchRenderScope<SearchValues extends object> {
	form: FormInstance<SearchValues>;
}

/** 表格列对应的搜索配置。 */
export interface TableProSearchConfig<SearchValues extends object> {
	type?: TableProSearchType;
	key?: string;
	label?: ReactNode;
	order?: number;
	span?: number;
	offset?: number;
	defaultValue?: unknown;
	placeholder?: string;
	props?: Record<string, unknown>;
	render?: (scope: TableProSearchRenderScope<SearchValues>) => ReactNode;
	xs?: TableProResponsive;
	sm?: TableProResponsive;
	md?: TableProResponsive;
	lg?: TableProResponsive;
	xl?: TableProResponsive;
}

/** 同时描述表格展示和搜索表单的列配置。 */
export interface TableProColumn<RecordType extends object, SearchValues extends object = Record<string, unknown>>
	extends ColumnType<RecordType> {
	search?: TableProSearchConfig<SearchValues>;
	enum?: Array<{ label: ReactNode; value: string | number; disabled?: boolean }>;
}

/** React 版 TablePro 的公共属性。 */
export interface TableProProps<RecordType extends object, SearchValues extends object = Record<string, unknown>>
	extends Omit<TableProps<RecordType>, "columns"> {
	columns: Array<TableProColumn<RecordType, SearchValues>>;
	searchCols?: number | Partial<Record<TableProBreakpoint, number>>;
	searchForm?: FormInstance<SearchValues>;
	onSearch?: (values: SearchValues) => void;
	onReset?: () => void;
	headerLeft?: ReactNode;
	headerRight?: ReactNode;
}
