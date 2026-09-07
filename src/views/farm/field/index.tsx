import { useCallback, useEffect, useState } from "react";
import { Button, Popconfirm, Space, Switch, Tag, message } from "antd";
import type { Moment } from "moment";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type {
	FarmConfigStatus,
	FarmFieldForm,
	FarmFieldListParams,
	FarmFieldRecord,
	FarmFieldType
} from "@/api/interface/farmConfig";
import { changeFarmFieldStatus, deleteFarmFields, getFarmFieldList, saveFarmField } from "@/api/modules/farmConfig";
import TablePro from "@/components/TablePro";
import type { TableProColumn } from "@/components/TablePro";
import FieldEditor from "./components/FieldEditor";
import "../config.less";

/** 农事字段搜索表单值。 */
interface FarmFieldSearchValues {
	farmingFieldName?: string;
	farmingFieldType?: FarmFieldType;
	status?: FarmConfigStatus;
	createTime?: [Moment, Moment];
}

/** 农事字段类型展示配置。 */
const FIELD_TYPE_META = {
	"1": { color: "blue", text: "文本" },
	"2": { color: "green", text: "单选" },
	"3": { color: "purple", text: "多选" }
} as const;

/** 启停状态搜索选项。 */
const STATUS_OPTIONS = [
	{ label: "启用", value: "1" },
	{ label: "禁用", value: "0" }
];

/** 农事字段管理页面。 */
const FarmField = () => {
	// 查询条件和分页在写操作刷新时保持不变。
	const [filters, setFilters] = useState<FarmFieldListParams>({});
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	// 列表、选择项及异步状态分别维护。
	const [records, setRecords] = useState<FarmFieldRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
	const [loading, setLoading] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// editor 为 undefined 时表示新建，null 表示弹窗关闭。
	const [editor, setEditor] = useState<FarmFieldRecord | null | undefined>(null);

	/** 加载当前筛选与分页对应的农事字段。 */
	const loadFields = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getFarmFieldList({ ...filters, pageNum, pageSize });
			if (!response.data) throw new Error("缺少农事字段列表");
			setRecords(response.data.rows);
			setTotal(response.data.total);
		} catch {
			setRecords([]);
			setTotal(0);
			message.error("农事字段加载失败，请重试");
		} finally {
			setLoading(false);
		}
	}, [filters, pageNum, pageSize]);

	useEffect(() => {
		// 查询、翻页或写操作完成时刷新列表。
		void loadFields();
	}, [loadFields, revision]);

	/** 应用字段筛选并回到第一页。 */
	const applyFilters = (values: FarmFieldSearchValues) => {
		const { createTime, ...rest } = values;
		setFilters({
			...rest,
			beginTime: createTime?.[0]?.format("YYYY-MM-DD"),
			endsTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
		setPageNum(1);
	};

	/** 清空筛选条件并回到第一页。 */
	const resetFilters = () => {
		setFilters({});
		setPageNum(1);
	};

	/** 保存字段后关闭弹窗并刷新列表。 */
	const submitField = async (values: FarmFieldForm) => {
		setWorking(true);
		try {
			await saveFarmField(values);
			message.success(`${values.farmingFieldId ? "编辑" : "新增"}农事字段成功`);
			setEditor(null);
			setRevision(value => value + 1);
		} catch {
			message.error("农事字段保存失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 切换单个字段状态。 */
	const toggleStatus = async (record: FarmFieldRecord, checked: boolean) => {
		setWorking(true);
		try {
			await changeFarmFieldStatus(record.farmingFieldId, checked ? "1" : "0");
			message.success(`已${checked ? "启用" : "禁用"}“${record.farmingFieldName}”`);
			setRevision(value => value + 1);
		} catch {
			message.error("状态更新失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 删除指定字段并同步清理其类型关联。 */
	const removeFields = async (ids: string[]) => {
		setWorking(true);
		try {
			await deleteFarmFields(ids);
			message.success("农事字段删除成功");
			setSelectedIds([]);
			setRevision(value => value + 1);
		} catch {
			message.error("农事字段删除失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	// TablePro 列配置同时生成筛选区和字段列表。
	const columns: Array<TableProColumn<FarmFieldRecord, FarmFieldSearchValues>> = [
		{ title: "字段名称", dataIndex: "farmingFieldName", width: 220, search: { type: "input" } },
		{
			title: "字段类型",
			dataIndex: "farmingFieldType",
			width: 140,
			search: { type: "select" },
			enum: [
				{ label: "文本", value: "1" },
				{ label: "单选", value: "2" },
				{ label: "多选", value: "3" }
			],
			render: value => {
				// 把字段编码转换为标签。
				const meta = FIELD_TYPE_META[value as keyof typeof FIELD_TYPE_META];
				return <Tag color={meta.color}>{meta.text}</Tag>;
			}
		},
		{
			title: "字段选项",
			dataIndex: "farmingFieldOptions",
			ellipsis: true,
			render: (_, record) => record.farmingFieldOptions.map(item => item.farmingFieldOptionContent).join("、") || "—"
		},
		{ title: "创建人", dataIndex: "createBy", width: 140 },
		{ title: "创建时间", dataIndex: "createTime", width: 190, search: { type: "date-range" } },
		{
			title: "状态",
			dataIndex: "status",
			width: 120,
			search: { type: "select" },
			enum: STATUS_OPTIONS,
			render: (_, record) => (
				<Switch
					checked={record.status === "1"}
					checkedChildren="启用"
					unCheckedChildren="禁用"
					disabled={working}
					onChange={checked => void toggleStatus(record, checked)}
				/>
			)
		},
		{
			title: "操作",
			key: "operation",
			width: 170,
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button type="link" icon={<EditOutlined />} onClick={() => setEditor(record)}>
						编辑
					</Button>
					<Popconfirm
						title="删除后会同步移除类型和方案中的字段关联，确定删除吗？"
						onConfirm={() => void removeFields([record.farmingFieldId])}
					>
						<Button type="link" danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className="farm-config-page">
			{/* 农事字段筛选、工具栏与列表 */}
			<TablePro<FarmFieldRecord, FarmFieldSearchValues>
				rowKey="farmingFieldId"
				columns={columns}
				dataSource={records}
				loading={loading}
				scroll={{ x: 1100 }}
				onSearch={applyFilters}
				onReset={resetFilters}
				headerLeft={
					<Space>
						<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditor(undefined)}>
							新建
						</Button>
						<Popconfirm
							disabled={!selectedIds.length}
							title="删除后会同步移除类型和方案中的字段关联，确定删除所选字段吗？"
							onConfirm={() => void removeFields(selectedIds.map(String))}
						>
							<Button disabled={!selectedIds.length} icon={<DeleteOutlined />}>
								删除
							</Button>
						</Popconfirm>
					</Space>
				}
				rowSelection={{ selectedRowKeys: selectedIds, onChange: keys => setSelectedIds(keys) }}
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showTotal: value => `共 ${value} 条`,
					onChange: (page, size) => {
						setPageNum(page);
						setPageSize(size);
					}
				}}
			/>
			{/* 字段新增编辑弹窗 */}
			<FieldEditor
				key={editor?.farmingFieldId || (editor === undefined ? "new" : "closed")}
				open={editor !== null}
				record={editor || undefined}
				submitting={working}
				onCancel={() => setEditor(null)}
				onSubmit={submitField}
			/>
		</div>
	);
};

export default FarmField;
