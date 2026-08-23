import NProgress from "@/config/nprogress";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/config/serviceLoading";
import { ResultData } from "@/api/interface";
import { ResultEnum } from "@/enums/httpEnum";
import { checkStatus } from "./helper/checkStatus";
import { AxiosCanceler } from "./helper/axiosCancel";
import { resetSession } from "@/redux/modules/global/action";
import { message } from "antd";
import { store } from "@/redux";

interface RequestConfig extends AxiosRequestConfig {
	showFullScreenLoading?: boolean;
}

/** 创建用于统一管理重复请求的取消器。 */
const axiosCanceler = new AxiosCanceler();

/** 集中维护当前模块使用的配置项。 */
const config: AxiosRequestConfig = {
	baseURL: import.meta.env.VITE_API_URL,
	timeout: Number(ResultEnum.TIMEOUT),
	withCredentials: true
};

/** 判断接口业务状态码是否表示成功。 */
const isResultCode = (code: unknown, expected: ResultEnum) => String(code) === String(expected);

class RequestHttp {
	service: AxiosInstance;

	public constructor(requestConfig: AxiosRequestConfig) {
		this.service = axios.create(requestConfig);

		this.service.interceptors.request.use(
			/* 转交请求拦截阶段产生的异常。 */ (config: RequestConfig) => {
				NProgress.start();
				axiosCanceler.addPending(config);

				// 复制请求头，便于移除内部控制字段。
				const headers = { ...config.headers } as Record<string, unknown>;
				config.showFullScreenLoading = headers.noLoading !== true;
				delete headers.noLoading;
				if (config.showFullScreenLoading) showFullScreenLoading();

				// 读取当前访问令牌。
				const token = store.getState().global.token;
				if (token) headers["x-access-token"] = token;

				return { ...config, headers };
			},
			/* 转交请求拦截阶段产生的异常。 */ (error: AxiosError) => Promise.reject(error)
		);

		this.service.interceptors.response.use(
			/* 统一处理响应异常并结束请求状态。 */ (response: AxiosResponse<ResultData>) => {
				// 读取接口响应中的业务数据。
				const { data } = response;
				this.finishRequest(response.config);

				if (isResultCode(data.code, ResultEnum.OVERDUE)) {
					store.dispatch(resetSession());
					message.error(data.msg || "登录已失效，请重新登录");
					window.location.hash = "/login";
					return Promise.reject(data);
				}

				if (data.code !== undefined && !isResultCode(data.code, ResultEnum.SUCCESS)) {
					message.error(data.msg || "请求失败");
					return Promise.reject(data);
				}

				return data;
			},
			/* 统一处理响应异常并结束请求状态。 */ (error: AxiosError) => {
				this.finishRequest(error.config);

				if (axios.isCancel(error)) return Promise.reject(error);
				if (error.message.includes("timeout")) message.error("请求超时，请稍后再试");
				if (error.response) checkStatus(error.response.status);
				if (!window.navigator.onLine) window.location.hash = "/500";
				return Promise.reject(error);
			}
		);
	}

	/** 结束请求进度、移除取消记录并关闭全屏加载。 */
	private finishRequest(config?: AxiosRequestConfig) {
		NProgress.done();
		if (!config) return;
		axiosCanceler.removePending(config);
		if ((config as RequestConfig).showFullScreenLoading) tryHideFullScreenLoading();
	}

	/** 发送 GET 请求并返回业务响应。 */
	get<T>(url: string, params?: object, requestConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.get(url, { params, ...requestConfig });
	}

	/** 发送 POST 请求并返回业务响应。 */
	post<T>(url: string, params?: object, requestConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.post(url, params, requestConfig);
	}

	/** 发送 PUT 请求并返回业务响应。 */
	put<T>(url: string, params?: object, requestConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.put(url, params, requestConfig);
	}

	/** 发送 DELETE 请求并返回业务响应。 */
	delete<T>(url: string, params?: object, requestConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.delete(url, { params, ...requestConfig });
	}
}

export default new RequestHttp(config);
