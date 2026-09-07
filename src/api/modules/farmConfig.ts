import type {
	FarmConfigStatus,
	FarmFieldForm,
	FarmFieldListParams,
	FarmSchemeForm,
	FarmSchemeListParams,
	FarmTypeForm,
	FarmTypeListParams
} from "@/api/interface/farmConfig";
import {
	changeMockFarmFieldStatus,
	changeMockFarmSchemeStatus,
	changeMockFarmTypeStatus,
	deleteMockFarmFields,
	deleteMockFarmSchemes,
	deleteMockFarmTypes,
	getMockFarmFieldList,
	getMockFarmSchemeDetail,
	getMockFarmSchemeList,
	getMockFarmTypeDetail,
	getMockFarmTypeList,
	saveMockFarmField,
	saveMockFarmScheme,
	saveMockFarmType
} from "./farmConfigMock";

/** 农作物字典，供三个配置页面复用。 */
export const FARM_CROP_OPTIONS = [
	{ label: "小麦", value: "wheat" },
	{ label: "玉米", value: "corn" },
	{ label: "水稻", value: "rice" },
	{ label: "大豆", value: "soybean" }
] as const;

/** 查询农事字段列表，当前固定走本地 Mock。 */
export const getFarmFieldList = (params: FarmFieldListParams = {}) => getMockFarmFieldList(params);

/** 新增或编辑农事字段。 */
export const saveFarmField = (form: FarmFieldForm) => saveMockFarmField(form);

/** 切换农事字段状态。 */
export const changeFarmFieldStatus = (id: string, status: FarmConfigStatus) => changeMockFarmFieldStatus(id, status);

/** 删除一个或多个农事字段。 */
export const deleteFarmFields = (ids: string[]) => deleteMockFarmFields(ids);

/** 查询农事类型列表，当前固定走本地 Mock。 */
export const getFarmTypeList = (params: FarmTypeListParams = {}) => getMockFarmTypeList(params);

/** 查询农事类型详情。 */
export const getFarmTypeDetail = (id: string) => getMockFarmTypeDetail(id);

/** 新增或编辑农事类型。 */
export const saveFarmType = (form: FarmTypeForm) => saveMockFarmType(form);

/** 切换农事类型状态。 */
export const changeFarmTypeStatus = (id: string, status: FarmConfigStatus) => changeMockFarmTypeStatus(id, status);

/** 删除一个或多个农事类型。 */
export const deleteFarmTypes = (ids: string[]) => deleteMockFarmTypes(ids);

/** 查询农技方案列表，当前固定走本地 Mock。 */
export const getFarmSchemeList = (params: FarmSchemeListParams = {}) => getMockFarmSchemeList(params);

/** 查询农技方案详情。 */
export const getFarmSchemeDetail = (id: string) => getMockFarmSchemeDetail(id);

/** 新增或编辑农技方案。 */
export const saveFarmScheme = (form: FarmSchemeForm) => saveMockFarmScheme(form);

/** 切换农技方案状态。 */
export const changeFarmSchemeStatus = (id: string, status: FarmConfigStatus) => changeMockFarmSchemeStatus(id, status);

/** 删除一个或多个农技方案。 */
export const deleteFarmSchemes = (ids: string[]) => deleteMockFarmSchemes(ids);
