import type { LandGpsPoint } from "@/api/interface/land";

/** 农事任务作业状态。 */
export type FarmWorkStatus = "1" | "2";

/** 农事地块经营类型。 */
export type FarmLandType = "1" | "2";

/** 农事地图中展示和选择的地块。 */
export interface FarmMapLand {
	id: string;
	landName: string;
	landType: FarmLandType;
	actualAcreNum: number;
	createName: string;
	createMobile: string;
	createTime: string;
	gpsList: LandGpsPoint[];
}

/** 农事任务的机耕队成员。 */
export interface FarmTeamMember {
	id: string;
	teamMemberName: string;
	teamMemberMobile: string;
}

/** 农事任务使用的作业标准字段。 */
export interface FarmStandardField {
	id: string;
	farmingFieldName: string;
	farmingFieldOptionContent: string;
}

/** 农事地图列表与详情共用的任务数据。 */
export interface FarmTaskRecord {
	farmingId: string;
	farmingName: string;
	dictLabel: string;
	dictValue: string;
	farmingTypeId: string;
	farmingTypeName: string;
	farmingScienceId: string;
	farmingScienceName: string;
	workStatus: FarmWorkStatus;
	workBeginTime: string;
	workEndTime: string;
	managerId: string;
	nickName: string;
	mobile: string;
	teamName: string;
	teamMobile: string;
	teamMemberVoList: FarmTeamMember[];
	lands: FarmMapLand[];
	landNum: number;
	totalArea: number;
	workArea: number;
	finishNum: number;
	typeFieldOptionRequestList: FarmStandardField[];
	createBy: string;
	createMobile: string;
	createTime: string;
	createSource: "1" | "2";
	assignBy: string;
	assignMobile: string;
	assignTime: string;
	assignSource: "1" | "2";
}

/** 农事任务列表筛选参数。 */
export interface FarmTaskListParams {
	searchValue?: string;
	dictValue?: string;
	farmingTypeId?: string;
	workStatus?: "" | FarmWorkStatus;
	createBy?: string;
	createBeginTime?: string;
	createEndTime?: string;
	teamMobile?: string;
	mobile?: string;
	beginTotalArea?: number;
	endsTotalArea?: number;
	workBeginArea?: number;
	workEndArea?: number;
}

/** 农事任务列表响应。 */
export interface FarmTaskPage {
	rows: FarmTaskRecord[];
	total: number;
}

/** 农事任务面积与完成度统计。 */
export interface FarmAreaCount {
	countTotalArea: number;
	countWorkArea: number;
	countFinishNum: number;
}

/** 农事任务状态数量统计。 */
export interface FarmStatusCount {
	allCount: number;
	workingCount: number;
	finishedCount: number;
}

/** 农机作业轨迹的单个经纬度点。 */
export interface FarmTrajectoryPoint {
	lng: number;
	lat: number;
	time: string;
}

/** 农机作业轨迹记录。 */
export interface FarmTrajectory {
	farmingLocusId: string;
	locusType: "planned" | "actual";
	locusGpsList: FarmTrajectoryPoint[];
}

/** 农事新增和编辑表单。 */
export interface FarmTaskForm {
	farmingId?: string;
	farmingName: string;
	dictValue: string;
	farmingScienceId: string;
	farmingTypeId: string;
	workBeginTime: string;
	workEndTime: string;
	managerId: string;
	teamMobile: string;
	landIds: string[];
}

/** 农事地块分配提交参数。 */
export interface FarmAssignmentForm {
	farmingId: string;
	assignMobile: string;
	landIds: string[];
}

/** 农事编辑器下拉选项。 */
export interface FarmOption {
	value: string;
	label: string;
	parentValue?: string;
	mobile?: string;
}

/** 农事编辑器所需的全部基础选项。 */
export interface FarmFormOptions {
	crops: FarmOption[];
	farmingTypes: FarmOption[];
	standards: FarmOption[];
	managers: FarmOption[];
}

/** 可分配地块查询参数。 */
export interface FarmLandListParams {
	landType?: "" | FarmLandType;
	dictValue?: string;
	farmingTypeId?: string;
	managerId?: string;
}
