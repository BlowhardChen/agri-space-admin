import { Form, Table } from "antd";
import type { TableProColumn, TableProProps } from "./interface";
import TableProSearchForm from "./SearchForm";
import "./index.less";

/** React 版地约 TablePro，统一搜索、工具栏、表格和分页区域。 */
const TablePro = <RecordType extends object, SearchValues extends object = Record<string, unknown>>({
	columns,
	searchCols,
	searchForm,
	onSearch,
	onReset,
	headerLeft,
	headerRight,
	...tableProps
}: TableProProps<RecordType, SearchValues>) => {
	// 未传入表单实例时由组件维护搜索值。
	const [internalForm] = Form.useForm<SearchValues>();
	const form = searchForm || internalForm;
	// 搜索配置只提供给搜索区，传给 Ant Design Table 前需要剥离。
	const tableColumns = columns.map(column => {
		const { search, enum: enumOptions, ...tableColumn } = column;
		void search;
		void enumOptions;
		return tableColumn;
	}) as Array<TableProColumn<RecordType, SearchValues>>;
	const hasSearch = columns.some(column => !!column.search);

	return (
		<div className="table-pro">
			{/* 表格搜索卡片 */}
			{hasSearch && <TableProSearchForm columns={columns} cols={searchCols} form={form} onSearch={onSearch} onReset={onReset} />}
			{/* 表格工具栏、主体和分页 */}
			<div className="table-pro-main-card">
				{(headerLeft || headerRight) && (
					<div className="table-pro-header">
						<div className="table-pro-header-left">{headerLeft}</div>
						<div className="table-pro-header-right">{headerRight}</div>
					</div>
				)}
				<Table<RecordType> {...tableProps} columns={tableColumns} />
			</div>
		</div>
	);
};

export type { TableProBreakpoint, TableProColumn, TableProProps, TableProSearchConfig } from "./interface";
export default TablePro;
