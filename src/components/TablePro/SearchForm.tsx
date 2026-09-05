import { useMemo, useState } from "react";
import { Button, DatePicker, Form, Grid, Input, InputNumber, Select, Space } from "antd";
import type { FormInstance } from "antd";
import { DownOutlined, ReloadOutlined, UpOutlined } from "@ant-design/icons";
import type {
	TableProBreakpoint,
	TableProColumn,
	TableProResponsive,
	TableProSearchConfig,
	TableProSearchType
} from "./interface";

/** 搜索表单使用的默认响应式列数，与地约后台 Grid 配置保持一致。 */
const DEFAULT_SEARCH_COLS: Record<TableProBreakpoint, number> = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 };

/** 搜索表单组件属性。 */
interface TableProSearchFormProps<RecordType extends object, SearchValues extends object> {
	columns: Array<TableProColumn<RecordType, SearchValues>>;
	cols?: number | Partial<Record<TableProBreakpoint, number>>;
	form: FormInstance<SearchValues>;
	onSearch?: (values: SearchValues) => void;
	onReset?: () => void;
}

/** 从 Ant Design 断点状态中选出当前 TablePro 断点。 */
const resolveBreakpoint = (screens: Partial<Record<string, boolean>>): TableProBreakpoint => {
	if (screens.xxl || screens.xl) return "xl";
	if (screens.lg) return "lg";
	if (screens.md) return "md";
	if (screens.sm) return "sm";
	return "xs";
};

/** 返回搜索项在当前断点下生效的跨度配置。 */
const resolveResponsive = <SearchValues extends object>(
	search: TableProSearchConfig<SearchValues>,
	breakpoint: TableProBreakpoint
): Required<TableProResponsive> => ({
	span: search[breakpoint]?.span ?? search.span ?? 1,
	offset: search[breakpoint]?.offset ?? search.offset ?? 0
});

/** 根据列配置渲染 Ant Design 搜索控件。 */
const renderSearchControl = <SearchValues extends object>(
	type: TableProSearchType,
	search: TableProSearchConfig<SearchValues>,
	options?: Array<{ label: React.ReactNode; value: string | number; disabled?: boolean }>
) => {
	const props = search.props || {};
	const placeholder = search.placeholder ?? (type === "input" || type === "input-number" ? "请输入" : "请选择");
	if (type === "input-number") return <InputNumber {...props} min={0} placeholder={placeholder} style={{ width: "100%" }} />;
	if (type === "select") return <Select {...props} allowClear placeholder={placeholder} options={options} />;
	if (type === "date-picker") return <DatePicker {...props} placeholder={placeholder} style={{ width: "100%" }} />;
	if (type === "date-range")
		return <DatePicker.RangePicker {...props} placeholder={["开始时间", "结束时间"]} style={{ width: "100%" }} />;
	return <Input {...props} allowClear placeholder={placeholder} />;
};

/** TablePro 配套搜索表单，复刻源 Grid 的折叠和 suffix 补位规则。 */
const TableProSearchForm = <RecordType extends object, SearchValues extends object>({
	columns,
	cols = DEFAULT_SEARCH_COLS,
	form,
	onSearch,
	onReset
}: TableProSearchFormProps<RecordType, SearchValues>) => {
	// 使用视口断点计算当前搜索网格列数。
	const screens = Grid.useBreakpoint();
	const breakpoint = resolveBreakpoint(screens);
	const columnCount = typeof cols === "number" ? cols : cols[breakpoint] ?? DEFAULT_SEARCH_COLS[breakpoint];
	// 搜索项默认折叠为一行，并为操作 suffix 预留最后一列。
	const [collapsed, setCollapsed] = useState(true);
	const searchColumns = useMemo(
		() => columns.filter(column => !!column.search).sort((left, right) => (left.search?.order ?? 0) - (right.search?.order ?? 0)),
		[columns]
	);
	const totalUnits = searchColumns.reduce((sum, column) => {
		const size = resolveResponsive(column.search!, breakpoint);
		return sum + size.span + size.offset;
	}, 0);
	const collapsedCapacity = Math.max(1, columnCount - 1);
	const showCollapse = totalUnits > collapsedCapacity;
	// 按源 Grid 累加 span，确保折叠时不会挤占 suffix 操作列。
	let occupiedUnits = 0;
	const visibleColumns = collapsed
		? searchColumns.filter(column => {
				const size = resolveResponsive(column.search!, breakpoint);
				occupiedUnits += size.span + size.offset;
				return occupiedUnits <= collapsedCapacity;
		  })
		: searchColumns;

	/** 重置表单及页面已应用的搜索条件。 */
	const reset = () => {
		form.resetFields();
		onReset?.();
	};

	return (
		<div className="table-pro-search-card">
			{/* 配置驱动的响应式搜索网格 */}
			<Form<SearchValues>
				form={form}
				labelAlign="right"
				labelCol={{ flex: "140px" }}
				wrapperCol={{ flex: 1 }}
				onFinish={values => onSearch?.(values)}
			>
				<div className="table-pro-search-grid" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
					{visibleColumns.map((column, index) => {
						const search = column.search!;
						const size = resolveResponsive(search, breakpoint);
						const fieldKey = search.key ?? String(column.dataIndex);
						const fieldLabel = search.label ?? (typeof column.title === "function" ? fieldKey : column.title);
						return (
							<div
								key={`${fieldKey}-${index}`}
								className="table-pro-search-item"
								style={{ gridColumn: `span ${Math.min(columnCount, size.span + size.offset)}` }}
							>
								<Form.Item name={search.render ? undefined : fieldKey} label={fieldLabel} initialValue={search.defaultValue}>
									{search.render ? search.render({ form }) : renderSearchControl(search.type ?? "input", search, column.enum)}
								</Form.Item>
							</div>
						);
					})}
					{/* 查询操作固定为 suffix，始终落在当前网格的最后一列。 */}
					<div className="table-pro-search-operation" style={{ gridColumnStart: columnCount }}>
						<Space>
							<Button type="primary" htmlType="submit">
								查询
							</Button>
							<Button icon={<ReloadOutlined />} onClick={reset}>
								重置
							</Button>
							{showCollapse && (
								<Button type="link" className="table-pro-search-toggle" onClick={() => setCollapsed(value => !value)}>
									{collapsed ? "展开" : "收起"} {collapsed ? <DownOutlined /> : <UpOutlined />}
								</Button>
							)}
						</Space>
					</div>
				</div>
			</Form>
		</div>
	);
};

export default TableProSearchForm;
