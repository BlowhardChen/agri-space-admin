import { useCallback, useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Select, Space, Switch, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Moment } from "moment";
import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, StopOutlined } from "@ant-design/icons";
import type { VillageListParams, VillageRecord } from "@/api/interface/land";
import { deleteVillages, editVillageStatus, getVillageList } from "@/api/modules/land";
import VillageEditor from "./components/VillageEditor";
import "./index.less";

/** 行政村管理筛选表单中日期范围的临时字段。 */
interface VillageSearchValues extends VillageListParams {
	createTime?: [Moment, Moment];
}

/** 行政村管理页面，迁移地约表格筛选、维护及批量操作。 */
const VillageManagement = () => {
	// 管理查询条件和当前页码分开保存，便于翻页后保留筛选。
	const [filters, setFilters] = useState<VillageListParams>({});
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	// 保存本地 mock 或后端返回的表格数据及其总数。
	const [records, setRecords] = useState<VillageRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [revision, setRevision] = useState(0);
	// 保存批量启用、停用和删除的已选行政村 ID。
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	// 保存新增或编辑弹窗所对应的记录；undefined 表示当前不打开弹窗。
	const [editingRecord, setEditingRecord] = useState<VillageRecord | null | undefined>(undefined);
	// 创建与筛选字段绑定的 Ant Design 表单。
	const [searchForm] = Form.useForm<VillageSearchValues>();

	/** 加载当前筛选条件和分页下的行政村列表。 */
	const loadVillages = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getVillageList({ ...filters, pageNum, pageSize });
			setRecords(response.data?.rows || []);
			setTotal(response.data?.total || 0);
		} catch {
			message.error("行政村列表加载失败，请重试");
			setRecords([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [filters, pageNum, pageSize]);

	useEffect(() => {
		// 筛选、翻页或维护操作完成后重新读取列表。
		void loadVillages();
	}, [loadVillages, revision]);

	/** 将日期控件值转换为地约接口需要的起止日期筛选字段。 */
	const applyFilters = (values: VillageSearchValues) => {
		const { createTime, ...rest } = values;
		setFilters({
			...rest,
			beginTime: createTime?.[0]?.format("YYYY-MM-DD"),
			endsTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
		setPageNum(1);
		setSelectedIds([]);
	};

	/** 清空查询表单和已应用筛选，恢复行政村完整列表。 */
	const resetFilters = () => {
		searchForm.resetFields();
		setFilters({});
		setPageNum(1);
		setSelectedIds([]);
	};

	/** 刷新列表并同时清除上一轮批量选择。 */
	const refresh = () => {
		setSelectedIds([]);
		setRevision(value => value + 1);
	};

	/** 对选中行政村执行批量启用或停用操作。 */
	const updateSelectedStatus = async (status: "0" | "1") => {
		if (!selectedIds.length) return;
		try {
			await editVillageStatus({ ids: selectedIds, status });
			message.success(status === "1" ? "已启用所选行政村" : "已停用所选行政村");
			refresh();
		} catch {
			message.error("状态更新失败，请稍后重试");
		}
	};

	/** 切换单个行政村的启用状态。 */
	const updateRecordStatus = async (record: VillageRecord, enabled: boolean) => {
		try {
			await editVillageStatus({ ids: [record.id], status: enabled ? "1" : "0" });
			message.success(enabled ? `已启用 ${record.name}` : `已停用 ${record.name}`);
			refresh();
		} catch {
			message.error("状态更新失败，请稍后重试");
		}
	};

	/** 弹出删除确认并移除一个或多个行政村。 */
	const confirmDelete = (ids: string[], description: string) => {
		Modal.confirm({
			title: "删除行政村",
			content: description,
			okText: "删除",
			cancelText: "取消",
			okButtonProps: { danger: true },
			onOk: async () => {
				await deleteVillages(ids);
				message.success("行政村已删除");
				refresh();
			}
		});
	};

	// 配置与地约源表格对应的列、状态开关和行操作。
	const columns: ColumnsType<VillageRecord> = [
		{ title: "创建单位名称", dataIndex: "deptName", width: 180, ellipsis: true },
		{ title: "行政村名称", dataIndex: "name", width: 180, ellipsis: true },
		{ title: "创建人", dataIndex: "createBy", width: 140, ellipsis: true },
		{
			title: "状态",
			dataIndex: "status",
			width: 140,
			render: (_status, record) => (
				<Space className="village-status" size={8}>
					<Switch
						checked={record.status === "1"}
						checkedChildren="启用"
						unCheckedChildren="停用"
						onChange={enabled => void updateRecordStatus(record, enabled)}
					/>
					<Tag color={record.status === "1" ? "green" : "default"}>{record.status === "1" ? "启用" : "停用"}</Tag>
				</Space>
			)
		},
		{ title: "创建时间", dataIndex: "createTime", width: 180 },
		{
			title: "操作",
			key: "action",
			width: 180,
			fixed: "right",
			render: (_value, record) => (
				<Space size={4}>
					<Button type="link" icon={<EditOutlined />} onClick={() => setEditingRecord(record)}>
						编辑
					</Button>
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						onClick={() => confirmDelete([record.id], `删除“${record.name}”后不可恢复，是否继续？`)}
					>
						删除
					</Button>
				</Space>
			)
		}
	];

	// 渲染行政村筛选、批量维护和列表表格。
	return (
		<section className="village-management">
			{/* 查询行政村的名称、创建单位、创建人、状态与日期 */}
			<Form className="village-search-form" form={searchForm} layout="inline" onFinish={applyFilters}>
				<Form.Item name="deptName" label="创建单位">
					<Input allowClear placeholder="请输入创建单位" />
				</Form.Item>
				<Form.Item name="name" label="行政村">
					<Input allowClear placeholder="请输入行政村名称" />
				</Form.Item>
				<Form.Item name="createBy" label="创建人">
					<Input allowClear placeholder="请输入创建人" />
				</Form.Item>
				<Form.Item name="status" label="状态">
					<Select
						allowClear
						placeholder="全部状态"
						style={{ width: 120 }}
						options={[
							{ value: "1", label: "启用" },
							{ value: "0", label: "停用" }
						]}
					/>
				</Form.Item>
				<Form.Item name="createTime" label="创建时间">
					<DatePicker.RangePicker />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit">
							查询
						</Button>
						<Button onClick={resetFilters}>重置</Button>
					</Space>
				</Form.Item>
			</Form>

			{/* 新增、批量启停、删除和刷新操作 */}
			<div className="village-toolbar">
				<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditingRecord(null)}>
					新增
				</Button>
				<Button icon={<CheckOutlined />} disabled={!selectedIds.length} onClick={() => void updateSelectedStatus("1")}>
					启用
				</Button>
				<Button icon={<StopOutlined />} disabled={!selectedIds.length} onClick={() => void updateSelectedStatus("0")}>
					禁用
				</Button>
				<Button
					danger
					icon={<DeleteOutlined />}
					disabled={!selectedIds.length}
					onClick={() => confirmDelete(selectedIds, `确定删除所选 ${selectedIds.length} 个行政村吗？`)}
				>
					删除
				</Button>
				<Button icon={<ReloadOutlined />} onClick={refresh}>
					刷新
				</Button>
			</div>

			{/* 行政村列表、行选择和分页 */}
			<Table<VillageRecord>
				rowKey="id"
				loading={loading}
				columns={columns}
				dataSource={records}
				scroll={{ x: 960 }}
				rowSelection={{
					selectedRowKeys: selectedIds,
					onChange: keys => setSelectedIds(keys.map(String))
				}}
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showTotal: count => `共 ${count} 条`,
					onChange: (nextPage, nextSize) => {
						setPageNum(nextPage);
						setPageSize(nextSize);
						setSelectedIds([]);
					}
				}}
			/>

			{/* 新增或编辑行政村弹窗 */}
			<VillageEditor
				visible={editingRecord !== undefined}
				record={editingRecord || undefined}
				onClose={() => setEditingRecord(undefined)}
				onSaved={() => {
					setEditingRecord(undefined);
					refresh();
				}}
			/>
		</section>
	);
};

export default VillageManagement;
