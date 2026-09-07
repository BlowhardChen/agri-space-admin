/** 农事配置通用启停状态。 */
export type FarmConfigStatus = "0" | "1";

/** 农事字段控件类型：文本、单选或多选。 */
export type FarmFieldType = "1" | "2" | "3";

/** 当前支持的农作物编码。 */
export type FarmCropValue = "wheat" | "corn" | "rice" | "soybean";

/** 农作物字典选项。 */
export interface FarmCropOption {
	label: string;
	value: FarmCropValue;
}

/** 农事字段可选项。 */
export interface FarmFieldOption {
	farmingFieldOptionId: string;
	farmingFieldOptionContent: string;
}

/** 农事字段列表记录。 */
export interface FarmFieldRecord {
	farmingFieldId: string;
	farmingFieldName: string;
	farmingFieldType: FarmFieldType;
	farmingFieldOptions: FarmFieldOption[];
	status: FarmConfigStatus;
	createBy: string;
	createTime: string;
}

/** 农事字段新增或编辑表单。 */
export interface FarmFieldForm {
	farmingFieldId?: string;
	farmingFieldName: string;
	farmingFieldType: FarmFieldType;
	farmingFieldOptions?: Array<
		Pick<FarmFieldOption, "farmingFieldOptionContent"> & Partial<Pick<FarmFieldOption, "farmingFieldOptionId">>
	>;
}

/** 农事字段分页查询参数。 */
export interface FarmFieldListParams {
	farmingFieldName?: string;
	farmingFieldType?: FarmFieldType;
	status?: FarmConfigStatus;
	beginTime?: string;
	endsTime?: string;
	pageNum?: number;
	pageSize?: number;
}

/** 农事类型列表记录。 */
export interface FarmTypeRecord {
	farmingTypeId: string;
	farmingTypeName: string;
	dictValue: FarmCropValue;
	farmingFields: FarmFieldRecord[];
	status: FarmConfigStatus;
	createName: string;
	createMobile: string;
	createTime: string;
}

/** 农事类型新增或编辑表单。 */
export interface FarmTypeForm {
	farmingTypeId?: string;
	farmingTypeName: string;
	dictValue: FarmCropValue;
	farmingFieldIds: string[];
}

/** 农事类型分页查询参数。 */
export interface FarmTypeListParams {
	farmingTypeName?: string;
	dictValue?: FarmCropValue;
	createName?: string;
	createMobile?: string;
	status?: FarmConfigStatus;
	beginTime?: string;
	endsTime?: string;
	pageNum?: number;
	pageSize?: number;
}

/** 农技方案中单个字段的填写结果。 */
export interface FarmSchemeFieldValue {
	farmingFieldId: string;
	farmingFieldName: string;
	farmingFieldType: FarmFieldType;
	values: string[];
}

/** 农技方案中已配置的农事类型。 */
export interface FarmSchemeTypeValue {
	farmingTypeId: string;
	farmingTypeName: string;
	fields: FarmSchemeFieldValue[];
}

/** 农技方案列表记录。 */
export interface FarmSchemeRecord {
	farmingScienceId: string;
	farmingScienceName: string;
	dictValue: FarmCropValue;
	status: FarmConfigStatus;
	attachmentName?: string;
	attachmentUrl?: string;
	remark?: string;
	farmingScienceTypes: FarmSchemeTypeValue[];
	createBy: string;
	createTime: string;
}

/** 农技方案新增或编辑表单。 */
export interface FarmSchemeForm {
	farmingScienceId?: string;
	farmingScienceName: string;
	dictValue: FarmCropValue;
	status: FarmConfigStatus;
	attachmentName?: string;
	attachmentUrl?: string;
	remark?: string;
	farmingScienceTypes: FarmSchemeTypeValue[];
}

/** 农技方案分页查询参数。 */
export interface FarmSchemeListParams {
	farmingScienceName?: string;
	dictValue?: FarmCropValue;
	createBy?: string;
	status?: FarmConfigStatus;
	remark?: string;
	beginTime?: string;
	endsTime?: string;
	pageNum?: number;
	pageSize?: number;
}

/** 三个农事配置列表共用的分页响应结构。 */
export interface FarmConfigPage<T> {
	rows: T[];
	total: number;
	pageNum: number;
	pageSize: number;
}
