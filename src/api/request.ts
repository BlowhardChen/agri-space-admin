import axios, {AxiosResponse, AxiosError} from "axios";

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage中获取token
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const {data} = response;
    if (data.code !== 200) {
      // 处理错误
      console.error("请求失败:", data.message);
      return Promise.reject(data);
    }
    return data;
  },
  (error: AxiosError) => {
    // 处理网络错误
    console.error("网络错误:", error.message);
    return Promise.reject(error);
  },
);

// 封装请求方法
export const request = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>) => {
    return service.get<T, T>(url, { params })
  },
  post: <T = unknown>(url: string, data?: Record<string, unknown>) => {
    return service.post<T, T>(url, data)
  },
  put: <T = unknown>(url: string, data?: Record<string, unknown>) => {
    return service.put<T, T>(url, data)
  },
  delete: <T = unknown>(url: string, params?: Record<string, unknown>) => {
    return service.delete<T, T>(url, { params })
  }
};

export default service;
