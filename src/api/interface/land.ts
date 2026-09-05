/** 土地列表与筛选接口使用的分页响应。 */
export interface LandPage<T> {
	rows: T[];
	pageNum?: number;
	pageSize?: number;
	total?: number;
}

/** 后端保存的单个地块经纬度点，坐标系为 EPSG:4326。 */
export interface LandGpsPoint {
	landId?: string;
	lng: number;
	lat: number;
	sort?: number;
}

/** 土地合同的付款日期。 */
export interface LandPaymentTime {
	id?: string;
	paymentTime: string;
}

/** 土地合同详情。 */
export interface LandContract {
	id?: string;
	landId?: string;
	contractNo?: string;
	termOfLease?: number;
	startTime?: string;
	endTime?: string;
	perAcreAmount?: number;
	totalAmount?: number;
	paymentAmount?: number;
	paymentMethod?: "1" | "2" | "3";
	actualAcreNum?: number;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	detailaddress?: string;
	relename?: string;
	cardid?: string;
	mobile?: string;
	bankAccount?: string;
	openBank?: string;
	times?: LandPaymentTime[];
	createTime?: string;
	createName?: string;
}

/** 土地信息页展示的地块记录。 */
export interface LandRecord {
	id: string;
	checked?: boolean;
	acreageNum?: number;
	actualAcreNum: number;
	administrativeVillage?: string;
	bankAccount?: string;
	cardid?: string;
	city?: string;
	country?: string;
	createMobile?: string;
	createName?: string;
	createTime?: string;
	detailaddress?: string;
	district?: string;
	formattedAddress?: string;
	gpsList: LandGpsPoint[];
	landList?: LandRecord[];
	landContract?: LandContract | null;
	landName: string;
	landType?: "1" | "2" | string;
	memberMobile?: string;
	memberName?: string;
	mobile?: string;
	openBank?: string;
	province?: string;
	quitStatus?: string;
	relename?: string;
	status?: string;
	township?: string;
	type?: "1" | "2" | string;
	url?: string;
}

/** 土地列表、高级筛选与地图区域筛选的请求参数。 */
export interface LandListParams {
	searchValue?: string;
	quitStatus?: "0" | "1";
	type?: "" | "1" | "2";
	cardid?: string;
	bankAccount?: string;
	relename?: string;
	mobile?: string;
	contractType?: string;
	landType?: string;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	detailaddress?: string;
	areaManager?: string;
	beginActualNum?: number;
	endActualNum?: number;
	beginTime?: string;
	endsTime?: string;
}

/** 土地页顶部的业务统计。 */
export interface LandCensus {
	acreageCount: number;
	landNum: number;
	administrativeVillageCount: number;
}

/** 行政村下拉选项。 */
export interface VillageRecord {
	id: string;
	name: string;
	status?: string;
	deptName?: string;
	createBy?: string;
	createTime?: string;
}

/** 行政村管理列表的筛选和分页参数。 */
export interface VillageListParams {
	pageNum?: number;
	pageSize?: number;
	deptName?: string;
	name?: string;
	createBy?: string;
	status?: "0" | "1";
	beginTime?: string;
	endsTime?: string;
}

/** 新增或编辑行政村时提交的字段。 */
export interface VillageForm {
	id?: string;
	name: string;
	status: "0" | "1";
}

/** 合并地块接口需要的地块引用。 */
export interface LandReference {
	landId: string;
}

/** 合并地块接口的完整提交参数。 */
export interface MergeLandParams {
	mergeLandName: string;
	mergeAcreageNum: number;
	country?: string;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	detailaddress?: string;
	url?: string;
	list: LandGpsPoint[];
	landOrList: LandReference[];
}

/** 转移地块接口中的单条地块关系。 */
export interface TransferLandItem {
	landId: string;
	type?: string;
}

/** 土地基础信息编辑表单。 */
export interface LandEditForm {
	id?: string;
	landName?: string;
	mobile?: string;
	cardid?: string;
	bankAccount?: string;
	landType?: string;
	actualAcreNum?: number;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	detailaddress?: string;
	landGps?: LandGpsPoint[];
}

/** 土地合同新增或修改表单。 */
export interface LandContractForm extends Omit<LandEditForm, "id">, LandContract {
	times?: LandPaymentTime[];
}

/** 通用上传接口返回的文件信息。 */
export interface UploadedFile {
	fileName: string;
	url?: string;
}

/** 逆地理编码返回的地址信息，直辖市的 city 可能是空数组。 */
export interface LandAddress {
	formatted_address?: string;
	addressComponent: {
		country?: string;
		province?: string;
		city?: string | string[];
		district?: string;
		township?: string;
	};
}
