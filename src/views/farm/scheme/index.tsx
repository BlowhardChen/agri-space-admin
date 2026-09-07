import { useCallback, useEffect, useState } from "react";
import { Button, Popconfirm, Space, Switch, Tag, message } from "antd";
import type { Moment } from "moment";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type {
	FarmConfigStatus,
	FarmCropValue,
	FarmSchemeForm,
	FarmSchemeListParams,
	FarmSchemeRecord
} from "@/api/interface/farmConfig";
import {
	FARM_CROP_OPTIONS,
	changeFarmSchemeStatus,
	deleteFarmSchemes,
	getFarmSchemeList,
	saveFarmScheme
} from "@/api/modules/farmConfig";
import TablePro from "@/components/TablePro";
import type { TableProColumn } from "@/components/TablePro";
import SchemeEditor from "./components/SchemeEditor";
import "../config.less";

/** 农技方案搜索表单值。 */
interface FarmSchemeSearchValues {
	farmingScienceName?: string;
	dictValue?: FarmCropValue;
	createBy?: string;
	status?: FarmConfigStatus;
	createTime?: [Moment, Moment];
	remark?: string;
}

/** 启停状态搜索选项。 */
const STATUS_OPTIONS = [
	{ label: "启用", value: "1" },
	{ label: "禁用", value: "0" }
];

/** 农作物编码对应的展示文案。 */
const CROP_LABELS = Object.fromEntries(FARM_CROP_OPTIONS.map(item => [item.value, item.label])) as Record<FarmCropValue, string>;

/** 农技方案管理页面。 */
const FarmScheme = () => {
	// 查询条件和分页在写操作刷新后保持不变。
	const [filters, setFilters] = useState<FarmSchemeListParams>({});
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	// 列表、选择项和异步状态分别维护。
	const [records, setRecords] = useState<FarmSchemeRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
	const [loading, setLoading] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// editor 为 undefined 时表示新增，null 表示关闭。
	const [editor, setEditor] = useState<FarmSchemeRecord | null | undefined>(null);

	/** 加载当前筛选和分页对应的农技方案。 */
	const loadSchemes = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getFarmSchemeList({ ...filters, pageNum, pageSize });
			if (!response.data) throw new Error("缺少农技方案列表");
			setRecords(response.data.rows);
			setTotal(response.data.total);
		} catch {
			setRecords([]);
			setTotal(0);
			message.error("农技方案加载失败，请重试");
		} finally {
			setLoading(false);
		}
	}, [filters, pageNum, pageSize]);

	useEffect(() => {
		// 查询、翻页或写操作后刷新列表。
		void loadSchemes();
	}, [loadSchemes, revision]);

	/** 应用列表筛选并回到第一页。 */
	const applyFilters = (values: FarmSchemeSearchValues) => {
		const { createTime, ...rest } = values;
		setFilters({
			...rest,
			beginTime: createTime?.[0]?.format("YYYY-MM-DD"),
			endsTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
		setPageNum(1);
	};

	/** 清空全部方案筛选条件。 */
	const resetFilters = () => {
		setFilters({});
		setPageNum(1);
	};

	/** 保存农技方案并刷新列表。 */
	const submitScheme = async (values: FarmSchemeForm) => {
		setWorking(true);
		try {
			await saveFarmScheme(values);
			message.success(`${values.farmingScienceId ? "编辑" : "新增"}农技方案成功`);
			setEditor(null);
			setRevision(value => value + 1);
		} catch {
			message.error("农技方案保存失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 切换单个方案状态。 */
	const toggleStatus = async (record: FarmSchemeRecord, checked: boolean) => {
		setWorking(true);
		try {
			await changeFarmSchemeStatus(record.farmingScienceId, checked ? "1" : "0");
			message.success(`已${checked ? "启用" : "禁用"}“${record.farmingScienceName}”`);
			setRevision(value => value + 1);
		} catch {
			message.error("状态更新失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 删除指定农技方案。 */
	const removeSchemes = async (ids: string[]) => {
		setWorking(true);
		try {
			await deleteFarmSchemes(ids);
			message.success("农技方案删除成功");
			setSelectedIds([]);
			setRevision(value => value + 1);
		} catch {
			message.error("农技方案删除失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	// TablePro 列配置同时生成筛选区和方案列表。
	const columns: Array<TableProColumn<FarmSchemeRecord, FarmSchemeSearchValues>> = [
		{ title: "方案名称", dataIndex: "farmingScienceName", width: 250, search: { type: "input" } },
		{
			title: "农事作物",
			dataIndex: "dictValue",
			width: 130,
			search: { type: "select" },
			enum: [...FARM_CROP_OPTIONS],
			render: value => CROP_LABELS[value as FarmCropValue]
		},
		{
			title: "农事类型",
			dataIndex: "farmingScienceTypes",
			width: 280,
			render: (_, record) => (
				<div className="farm-config-field-tags">
					{record.farmingScienceTypes.length
						? record.farmingScienceTypes.map(type => <Tag key={type.farmingTypeId}>{type.farmingTypeName}</Tag>)
						: "—"}
				</div>
			)
		},
		{ title: "创建人", dataIndex: "createBy", width: 140, search: { type: "input" } },
		{ title: "创建时间", dataIndex: "createTime", width: 190, search: { type: "date-range" } },
		{ title: "备注", dataIndex: "remark", width: 220, ellipsis: true, search: { type: "input" }, render: value => value || "—" },
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
					<Popconfirm title="确定删除该农技方案吗？" onConfirm={() => void removeSchemes([record.farmingScienceId])}>
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
			{/* 农技方案筛选、工具栏与列表 */}
			<TablePro<FarmSchemeRecord, FarmSchemeSearchValues>
				rowKey="farmingScienceId"
				columns={columns}
				dataSource={records}
				loading={loading}
				scroll={{ x: 1420 }}
				onSearch={applyFilters}
				onReset={resetFilters}
				headerLeft={
					<Space>
						<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditor(undefined)}>
							新建
						</Button>
						<Popconfirm
							disabled={!selectedIds.length}
							title="确定删除所选农技方案吗？"
							onConfirm={() => void removeSchemes(selectedIds.map(String))}
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
			{/* 方案新增编辑弹窗 */}
			<SchemeEditor
				key={editor?.farmingScienceId || (editor === undefined ? "new" : "closed")}
				open={editor !== null}
				record={editor || undefined}
				submitting={working}
				onCancel={() => setEditor(null)}
				onSubmit={submitScheme}
			/>
		</div>
	);
};

export default FarmScheme;
