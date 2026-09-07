import type { ResultData } from "@/api/interface";
import type {
	FarmConfigPage,
	FarmConfigStatus,
	FarmFieldForm,
	FarmFieldListParams,
	FarmFieldRecord,
	FarmSchemeForm,
	FarmSchemeListParams,
	FarmSchemeRecord,
	FarmTypeForm,
	FarmTypeListParams,
	FarmTypeRecord
} from "@/api/interface/farmConfig";

/** Mock 内部保存的农事类型关系，字段详情在读取时动态组装。 */
interface MockFarmType extends Omit<FarmTypeRecord, "farmingFields"> {
	farmingFieldIds: string[];
}

/** 创建符合项目请求层约定的成功响应。 */
const success = <T>(data: T): Promise<ResultData<T>> => Promise.resolve({ code: 200, msg: "success", data });

/** 深拷贝 Mock 返回值，避免表单直接修改内存数据。 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 判断文本是否满足列表的模糊筛选条件。 */
const includesFilter = (source: string | undefined, expected: string | undefined) =>
	!expected ||
	String(source || "")
		.toLowerCase()
		.includes(expected.trim().toLowerCase());

/** 判断记录创建日期是否落在筛选区间内。 */
const matchesDateRange = (createTime: string, beginTime?: string, endsTime?: string) => {
	// 列表日期筛选只比较年月日部分。
	const createDate = createTime.slice(0, 10);
	if (beginTime && createDate < beginTime) return false;
	return !(endsTime && createDate > endsTime);
};

/** 把完整记录切分成统一分页响应。 */
const paginate = <T>(records: T[], pageNum = 1, pageSize = 10): FarmConfigPage<T> => {
	// 保护分页参数，避免零值导致结果异常。
	const safePageNum = Math.max(1, pageNum);
	const safePageSize = Math.max(1, pageSize);
	// 计算当前页在完整记录中的起始位置。
	const start = (safePageNum - 1) * safePageSize;
	return {
		rows: records.slice(start, start + safePageSize),
		total: records.length,
		pageNum: safePageNum,
		pageSize: safePageSize
	};
};

/** 生成字段选项并使用稳定的 Mock 标识。 */
const option = (id: string, content: string) => ({ farmingFieldOptionId: id, farmingFieldOptionContent: content });

/** 农事字段 Mock 数据源。 */
let mockFields: FarmFieldRecord[] = [
	{
		farmingFieldId: "field-001",
		farmingFieldName: "作业面积（亩）",
		farmingFieldType: "1",
		farmingFieldOptions: [],
		status: "1",
		createBy: "系统管理员",
		createTime: "2026-08-02 09:20:00"
	},
	{
		farmingFieldId: "field-002",
		farmingFieldName: "作业方式",
		farmingFieldType: "2",
		farmingFieldOptions: [option("option-201", "人工"), option("option-202", "机械")],
		status: "1",
		createBy: "李春梅",
		createTime: "2026-08-03 10:15:00"
	},
	{
		farmingFieldId: "field-003",
		farmingFieldName: "肥料类型",
		farmingFieldType: "3",
		farmingFieldOptions: [option("option-301", "复合肥"), option("option-302", "有机肥"), option("option-303", "尿素")],
		status: "1",
		createBy: "李春梅",
		createTime: "2026-08-05 14:30:00"
	},
	{
		farmingFieldId: "field-004",
		farmingFieldName: "种子用量（公斤/亩）",
		farmingFieldType: "1",
		farmingFieldOptions: [],
		status: "1",
		createBy: "周志强",
		createTime: "2026-08-08 11:05:00"
	},
	{
		farmingFieldId: "field-005",
		farmingFieldName: "灌溉方式",
		farmingFieldType: "2",
		farmingFieldOptions: [option("option-501", "滴灌"), option("option-502", "喷灌"), option("option-503", "沟灌")],
		status: "1",
		createBy: "系统管理员",
		createTime: "2026-08-11 16:40:00"
	},
	{
		farmingFieldId: "field-006",
		farmingFieldName: "天气要求",
		farmingFieldType: "3",
		farmingFieldOptions: [option("option-601", "晴天"), option("option-602", "无风"), option("option-603", "土壤湿润")],
		status: "0",
		createBy: "周志强",
		createTime: "2026-08-16 08:55:00"
	}
];

/** 农事类型 Mock 数据源，仅存字段标识以保持跨页面联动。 */
let mockTypes: MockFarmType[] = [
	{
		farmingTypeId: "type-001",
		farmingTypeName: "整地",
		dictValue: "wheat",
		farmingFieldIds: ["field-001", "field-002"],
		status: "1",
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2026-08-18 09:12:00"
	},
	{
		farmingTypeId: "type-002",
		farmingTypeName: "播种",
		dictValue: "wheat",
		farmingFieldIds: ["field-001", "field-002", "field-004"],
		status: "1",
		createName: "周志强",
		createMobile: "13800138002",
		createTime: "2026-08-19 10:25:00"
	},
	{
		farmingTypeId: "type-003",
		farmingTypeName: "施肥",
		dictValue: "wheat",
		farmingFieldIds: ["field-001", "field-003", "field-002"],
		status: "1",
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2026-08-20 14:10:00"
	},
	{
		farmingTypeId: "type-004",
		farmingTypeName: "春灌",
		dictValue: "corn",
		farmingFieldIds: ["field-001", "field-005"],
		status: "1",
		createName: "赵国栋",
		createMobile: "13800138003",
		createTime: "2026-08-21 16:30:00"
	},
	{
		farmingTypeId: "type-005",
		farmingTypeName: "插秧",
		dictValue: "rice",
		farmingFieldIds: ["field-001", "field-002"],
		status: "1",
		createName: "赵国栋",
		createMobile: "13800138003",
		createTime: "2026-08-23 11:18:00"
	},
	{
		farmingTypeId: "type-006",
		farmingTypeName: "除草",
		dictValue: "soybean",
		farmingFieldIds: ["field-001", "field-002", "field-006"],
		status: "0",
		createName: "周志强",
		createMobile: "13800138002",
		createTime: "2026-08-25 15:45:00"
	}
];

/** 农技方案 Mock 数据源。 */
let mockSchemes: FarmSchemeRecord[] = [
	{
		farmingScienceId: "scheme-001",
		farmingScienceName: "冬小麦秋播标准方案",
		dictValue: "wheat",
		status: "1",
		attachmentName: "冬小麦秋播作业规范.pdf",
		attachmentUrl: "mock://冬小麦秋播作业规范.pdf",
		remark: "适用于墒情正常地块",
		farmingScienceTypes: [
			{
				farmingTypeId: "type-001",
				farmingTypeName: "整地",
				fields: [
					{ farmingFieldId: "field-001", farmingFieldName: "作业面积（亩）", farmingFieldType: "1", values: ["80"] },
					{ farmingFieldId: "field-002", farmingFieldName: "作业方式", farmingFieldType: "2", values: ["option-202"] }
				]
			},
			{
				farmingTypeId: "type-002",
				farmingTypeName: "播种",
				fields: [
					{ farmingFieldId: "field-001", farmingFieldName: "作业面积（亩）", farmingFieldType: "1", values: ["80"] },
					{ farmingFieldId: "field-002", farmingFieldName: "作业方式", farmingFieldType: "2", values: ["option-202"] },
					{ farmingFieldId: "field-004", farmingFieldName: "种子用量（公斤/亩）", farmingFieldType: "1", values: ["13"] }
				]
			}
		],
		createBy: "李春梅",
		createTime: "2026-08-26 09:40:00"
	},
	{
		farmingScienceId: "scheme-002",
		farmingScienceName: "玉米节水灌溉方案",
		dictValue: "corn",
		status: "1",
		remark: "优先采用滴灌",
		farmingScienceTypes: [
			{
				farmingTypeId: "type-004",
				farmingTypeName: "春灌",
				fields: [
					{ farmingFieldId: "field-001", farmingFieldName: "作业面积（亩）", farmingFieldType: "1", values: ["120"] },
					{ farmingFieldId: "field-005", farmingFieldName: "灌溉方式", farmingFieldType: "2", values: ["option-501"] }
				]
			}
		],
		createBy: "赵国栋",
		createTime: "2026-08-28 14:25:00"
	},
	{
		farmingScienceId: "scheme-003",
		farmingScienceName: "水稻标准插秧方案",
		dictValue: "rice",
		status: "0",
		remark: "试行方案",
		farmingScienceTypes: [
			{
				farmingTypeId: "type-005",
				farmingTypeName: "插秧",
				fields: [
					{ farmingFieldId: "field-001", farmingFieldName: "作业面积（亩）", farmingFieldType: "1", values: ["60"] },
					{ farmingFieldId: "field-002", farmingFieldName: "作业方式", farmingFieldType: "2", values: ["option-202"] }
				]
			}
		],
		createBy: "周志强",
		createTime: "2026-09-01 10:05:00"
	}
];

/** 依据内部关系组装带完整字段信息的农事类型。 */
const materializeType = (record: MockFarmType): FarmTypeRecord => ({
	...record,
	farmingFields: record.farmingFieldIds
		.map(fieldId => mockFields.find(field => field.farmingFieldId === fieldId))
		.filter((field): field is FarmFieldRecord => !!field)
});

/** 查询农事字段分页列表。 */
export const getMockFarmFieldList = (params: FarmFieldListParams = {}): Promise<ResultData<FarmConfigPage<FarmFieldRecord>>> => {
	// 依次应用字段、状态和创建时间筛选。
	const records = mockFields
		.filter(record => includesFilter(record.farmingFieldName, params.farmingFieldName))
		.filter(record => !params.farmingFieldType || record.farmingFieldType === params.farmingFieldType)
		.filter(record => !params.status || record.status === params.status)
		.filter(record => matchesDateRange(record.createTime, params.beginTime, params.endsTime))
		.sort((left, right) => right.createTime.localeCompare(left.createTime));
	return success(clone(paginate(records, params.pageNum, params.pageSize)));
};

/** 保存新增或编辑的农事字段。 */
export const saveMockFarmField = (form: FarmFieldForm): Promise<ResultData<null>> => {
	// 编辑时定位现有记录，新增时创建新的稳定标识。
	const current = form.farmingFieldId ? mockFields.find(record => record.farmingFieldId === form.farmingFieldId) : undefined;
	// 非文本字段需要保存可选项，文本字段始终清空选项。
	const fieldOptions =
		form.farmingFieldType === "1"
			? []
			: (form.farmingFieldOptions || []).map((item, index) => ({
					farmingFieldOptionId: item.farmingFieldOptionId || `option-${Date.now()}-${index}`,
					farmingFieldOptionContent: item.farmingFieldOptionContent
			  }));

	if (current) {
		current.farmingFieldName = form.farmingFieldName;
		current.farmingFieldType = form.farmingFieldType;
		current.farmingFieldOptions = fieldOptions;
		// 同步方案中的字段元数据，并移除已经不存在的选项值。
		mockSchemes.forEach(scheme =>
			scheme.farmingScienceTypes.forEach(type =>
				type.fields.forEach(field => {
					if (field.farmingFieldId !== current.farmingFieldId) return;
					field.farmingFieldName = current.farmingFieldName;
					field.farmingFieldType = current.farmingFieldType;
					if (current.farmingFieldType === "1") field.values = field.values.slice(0, 1);
					else field.values = field.values.filter(value => fieldOptions.some(item => item.farmingFieldOptionId === value));
				})
			)
		);
	} else {
		mockFields.unshift({
			farmingFieldId: `field-${Date.now()}`,
			farmingFieldName: form.farmingFieldName,
			farmingFieldType: form.farmingFieldType,
			farmingFieldOptions: fieldOptions,
			status: "1",
			createBy: "当前用户",
			createTime: new Date().toISOString().slice(0, 19).replace("T", " ")
		});
	}
	return success(null);
};

/** 切换农事字段启停状态。 */
export const changeMockFarmFieldStatus = (id: string, status: FarmConfigStatus): Promise<ResultData<null>> => {
	// 定位待切换字段。
	const record = mockFields.find(item => item.farmingFieldId === id);
	if (!record) return Promise.reject(new Error("未找到农事字段"));
	record.status = status;
	return success(null);
};

/** 删除农事字段并同步清理类型和方案中的关联。 */
export const deleteMockFarmFields = (ids: string[]): Promise<ResultData<null>> => {
	// 使用集合提升批量删除判断效率。
	const idSet = new Set(ids);
	mockFields = mockFields.filter(record => !idSet.has(record.farmingFieldId));
	mockTypes.forEach(record => {
		record.farmingFieldIds = record.farmingFieldIds.filter(id => !idSet.has(id));
	});
	mockSchemes.forEach(scheme =>
		scheme.farmingScienceTypes.forEach(type => {
			type.fields = type.fields.filter(field => !idSet.has(field.farmingFieldId));
		})
	);
	return success(null);
};

/** 查询农事类型分页列表。 */
export const getMockFarmTypeList = (params: FarmTypeListParams = {}): Promise<ResultData<FarmConfigPage<FarmTypeRecord>>> => {
	// 组装完整字段后应用作物、人员和日期筛选。
	const records = mockTypes
		.filter(record => includesFilter(record.farmingTypeName, params.farmingTypeName))
		.filter(record => !params.dictValue || record.dictValue === params.dictValue)
		.filter(record => includesFilter(record.createName, params.createName))
		.filter(record => includesFilter(record.createMobile, params.createMobile))
		.filter(record => !params.status || record.status === params.status)
		.filter(record => matchesDateRange(record.createTime, params.beginTime, params.endsTime))
		.sort((left, right) => right.createTime.localeCompare(left.createTime))
		.map(materializeType);
	return success(clone(paginate(records, params.pageNum, params.pageSize)));
};

/** 查询单条农事类型详情。 */
export const getMockFarmTypeDetail = (id: string): Promise<ResultData<FarmTypeRecord>> => {
	// 定位并展开字段关系。
	const record = mockTypes.find(item => item.farmingTypeId === id);
	return record ? success(clone(materializeType(record))) : Promise.reject(new Error("未找到农事类型"));
};

/** 保存新增或编辑的农事类型。 */
export const saveMockFarmType = (form: FarmTypeForm): Promise<ResultData<null>> => {
	// 编辑时定位现有类型。
	const current = form.farmingTypeId ? mockTypes.find(record => record.farmingTypeId === form.farmingTypeId) : undefined;
	if (current) {
		current.farmingTypeName = form.farmingTypeName;
		current.dictValue = form.dictValue;
		current.farmingFieldIds = [...form.farmingFieldIds];
		// 同步方案中的类型名称，并按新字段关联补齐或裁剪表单值。
		mockSchemes.forEach(scheme =>
			scheme.farmingScienceTypes.forEach(type => {
				if (type.farmingTypeId !== current.farmingTypeId) return;
				type.farmingTypeName = current.farmingTypeName;
				type.fields = current.farmingFieldIds
					.map(fieldId => {
						const field = mockFields.find(item => item.farmingFieldId === fieldId);
						const saved = type.fields.find(item => item.farmingFieldId === fieldId);
						return field
							? saved || {
									farmingFieldId: field.farmingFieldId,
									farmingFieldName: field.farmingFieldName,
									farmingFieldType: field.farmingFieldType,
									values: []
							  }
							: undefined;
					})
					.filter((field): field is NonNullable<typeof field> => !!field);
			})
		);
	} else {
		mockTypes.unshift({
			farmingTypeId: `type-${Date.now()}`,
			farmingTypeName: form.farmingTypeName,
			dictValue: form.dictValue,
			farmingFieldIds: [...form.farmingFieldIds],
			status: "1",
			createName: "当前用户",
			createMobile: "13800138000",
			createTime: new Date().toISOString().slice(0, 19).replace("T", " ")
		});
	}
	return success(null);
};

/** 切换农事类型启停状态。 */
export const changeMockFarmTypeStatus = (id: string, status: FarmConfigStatus): Promise<ResultData<null>> => {
	// 定位待切换类型。
	const record = mockTypes.find(item => item.farmingTypeId === id);
	if (!record) return Promise.reject(new Error("未找到农事类型"));
	record.status = status;
	return success(null);
};

/** 删除农事类型并同步移除方案中的类型配置。 */
export const deleteMockFarmTypes = (ids: string[]): Promise<ResultData<null>> => {
	// 使用集合同时清理类型数据与方案关系。
	const idSet = new Set(ids);
	mockTypes = mockTypes.filter(record => !idSet.has(record.farmingTypeId));
	mockSchemes.forEach(scheme => {
		scheme.farmingScienceTypes = scheme.farmingScienceTypes.filter(type => !idSet.has(type.farmingTypeId));
	});
	return success(null);
};

/** 查询农技方案分页列表。 */
export const getMockFarmSchemeList = (
	params: FarmSchemeListParams = {}
): Promise<ResultData<FarmConfigPage<FarmSchemeRecord>>> => {
	// 应用名称、作物、创建人、状态、备注和日期筛选。
	const records = mockSchemes
		.filter(record => includesFilter(record.farmingScienceName, params.farmingScienceName))
		.filter(record => !params.dictValue || record.dictValue === params.dictValue)
		.filter(record => includesFilter(record.createBy, params.createBy))
		.filter(record => !params.status || record.status === params.status)
		.filter(record => includesFilter(record.remark, params.remark))
		.filter(record => matchesDateRange(record.createTime, params.beginTime, params.endsTime))
		.sort((left, right) => right.createTime.localeCompare(left.createTime));
	return success(clone(paginate(records, params.pageNum, params.pageSize)));
};

/** 查询单条农技方案详情。 */
export const getMockFarmSchemeDetail = (id: string): Promise<ResultData<FarmSchemeRecord>> => {
	// 定位需要编辑或查看的方案。
	const record = mockSchemes.find(item => item.farmingScienceId === id);
	return record ? success(clone(record)) : Promise.reject(new Error("未找到农技方案"));
};

/** 保存新增或编辑的农技方案。 */
export const saveMockFarmScheme = (form: FarmSchemeForm): Promise<ResultData<null>> => {
	// 编辑时覆盖业务字段并保留创建信息。
	const current = form.farmingScienceId
		? mockSchemes.find(record => record.farmingScienceId === form.farmingScienceId)
		: undefined;
	if (current) Object.assign(current, clone(form));
	else {
		mockSchemes.unshift({
			...clone(form),
			farmingScienceId: `scheme-${Date.now()}`,
			createBy: "当前用户",
			createTime: new Date().toISOString().slice(0, 19).replace("T", " ")
		});
	}
	return success(null);
};

/** 切换农技方案启停状态。 */
export const changeMockFarmSchemeStatus = (id: string, status: FarmConfigStatus): Promise<ResultData<null>> => {
	// 定位待切换方案。
	const record = mockSchemes.find(item => item.farmingScienceId === id);
	if (!record) return Promise.reject(new Error("未找到农技方案"));
	record.status = status;
	return success(null);
};

/** 删除选中的农技方案。 */
export const deleteMockFarmSchemes = (ids: string[]): Promise<ResultData<null>> => {
	// 批量过滤命中的方案记录。
	const idSet = new Set(ids);
	mockSchemes = mockSchemes.filter(record => !idSet.has(record.farmingScienceId));
	return success(null);
};
