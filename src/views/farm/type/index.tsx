import { useCallback, useEffect, useState } from "react";
import { Button, Popconfirm, Radio, Space, Switch, Tag, message } from "antd";
import type { Moment } from "moment";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type {
	FarmConfigStatus,
	FarmCropValue,
	FarmTypeForm,
	FarmTypeListParams,
	FarmTypeRecord
} from "@/api/interface/farmConfig";
import {
	FARM_CROP_OPTIONS,
	changeFarmTypeStatus,
	deleteFarmTypes,
	getFarmTypeList,
	saveFarmType
} from "@/api/modules/farmConfig";
import TablePro from "@/components/TablePro";
import type { TableProColumn } from "@/components/TablePro";
import TypeEditor from "./components/TypeEditor";
import "../config.less";

/** 农事类型搜索表单值。 */
interface FarmTypeSearchValues {
	farmingTypeName?: string;
	createName?: string;
	createMobile?: string;
	status?: FarmConfigStatus;
	createTime?: [Moment, Moment];
}

/** 启停状态搜索选项。 */
const STATUS_OPTIONS = [
	{ label: "启用", value: "1" },
	{ label: "禁用", value: "0" }
];

/** 农事类型管理页面。 */
const FarmType = () => {
	// 作物标签独立于搜索条件，切换作物后自动返回第一页。
	const [crop, setCrop] = useState<FarmCropValue>("wheat");
	const [filters, setFilters] = useState<FarmTypeListParams>({});
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	// 列表、批量选择和异步操作状态。
	const [records, setRecords] = useState<FarmTypeRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
	const [loading, setLoading] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// editor 为 undefined 时表示新增，null 表示关闭。
	const [editor, setEditor] = useState<FarmTypeRecord | null | undefined>(null);

	/** 加载当前作物、筛选和分页下的农事类型。 */
	const loadTypes = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getFarmTypeList({ ...filters, dictValue: crop, pageNum, pageSize });
			if (!response.data) throw new Error("缺少农事类型列表");
			setRecords(response.data.rows);
			setTotal(response.data.total);
		} catch {
			setRecords([]);
			setTotal(0);
			message.error("农事类型加载失败，请重试");
		} finally {
			setLoading(false);
		}
	}, [crop, filters, pageNum, pageSize]);

	useEffect(() => {
		// 查询、作物切换、分页或写操作后刷新列表。
		void loadTypes();
	}, [loadTypes, revision]);

	/** 应用列表筛选并回到第一页。 */
	const applyFilters = (values: FarmTypeSearchValues) => {
		const { createTime, ...rest } = values;
		setFilters({
			...rest,
			beginTime: createTime?.[0]?.format("YYYY-MM-DD"),
			endsTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
		setPageNum(1);
	};

	/** 清空搜索条件。 */
	const resetFilters = () => {
		setFilters({});
		setPageNum(1);
	};

	/** 切换农作物标签并清空批量选择。 */
	const changeCrop = (value: FarmCropValue) => {
		setCrop(value);
		setPageNum(1);
		setSelectedIds([]);
	};

	/** 保存农事类型并刷新当前作物列表。 */
	const submitType = async (values: FarmTypeForm) => {
		setWorking(true);
		try {
			await saveFarmType(values);
			message.success(`${values.farmingTypeId ? "编辑" : "新增"}农事类型成功`);
			setEditor(null);
			setRevision(value => value + 1);
		} catch {
			message.error("农事类型保存失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 切换单个农事类型状态。 */
	const toggleStatus = async (record: FarmTypeRecord, checked: boolean) => {
		setWorking(true);
		try {
			await changeFarmTypeStatus(record.farmingTypeId, checked ? "1" : "0");
			message.success(`已${checked ? "启用" : "禁用"}“${record.farmingTypeName}”`);
			setRevision(value => value + 1);
		} catch {
			message.error("状态更新失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 删除指定类型并同步清理方案中的引用。 */
	const removeTypes = async (ids: string[]) => {
		setWorking(true);
		try {
			await deleteFarmTypes(ids);
			message.success("农事类型删除成功");
			setSelectedIds([]);
			setRevision(value => value + 1);
		} catch {
			message.error("农事类型删除失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	// TablePro 列配置同时生成筛选区和类型列表。
	const columns: Array<TableProColumn<FarmTypeRecord, FarmTypeSearchValues>> = [
		{ title: "农事类型", dataIndex: "farmingTypeName", width: 200, search: { type: "input" } },
		{
			title: "关联字段",
			dataIndex: "farmingFields",
			width: 360,
			render: (_, record) => (
				<div className="farm-config-field-tags">
					{record.farmingFields.length
						? record.farmingFields.map(field => <Tag key={field.farmingFieldId}>{field.farmingFieldName}</Tag>)
						: "—"}
				</div>
			)
		},
		{ title: "创建人", dataIndex: "createName", width: 140, search: { type: "input" } },
		{ title: "手机号码", dataIndex: "createMobile", width: 150, search: { type: "input" } },
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
						title="删除后会同步移除方案中的类型关联，确定删除吗？"
						onConfirm={() => void removeTypes([record.farmingTypeId])}
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
			{/* 农事类型筛选、作物标签、工具栏与列表 */}
			<TablePro<FarmTypeRecord, FarmTypeSearchValues>
				rowKey="farmingTypeId"
				columns={columns}
				dataSource={records}
				loading={loading}
				scroll={{ x: 1240 }}
				onSearch={applyFilters}
				onReset={resetFilters}
				headerLeft={
					<Space wrap>
						<Radio.Group value={crop} optionType="button" buttonStyle="solid" onChange={event => changeCrop(event.target.value)}>
							{FARM_CROP_OPTIONS.map(item => (
								<Radio.Button key={item.value} value={item.value}>
									{item.label}
								</Radio.Button>
							))}
						</Radio.Group>
						<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditor(undefined)}>
							新建
						</Button>
						<Popconfirm
							disabled={!selectedIds.length}
							title="删除后会同步移除方案中的类型关联，确定删除所选类型吗？"
							onConfirm={() => void removeTypes(selectedIds.map(String))}
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
			{/* 类型新增编辑弹窗 */}
			<TypeEditor
				key={editor?.farmingTypeId || (editor === undefined ? "new" : "closed")}
				open={editor !== null}
				crop={crop}
				record={editor || undefined}
				submitting={working}
				onCancel={() => setEditor(null)}
				onSubmit={submitType}
			/>
		</div>
	);
};

export default FarmType;
