import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/** 判断当前是否为开发环境。 */
export function isDevFn(mode: string): boolean {
	return mode === "development";
}

/** 判断当前是否为生产环境。 */
export function isProdFn(mode: string): boolean {
	return mode === "production";
}

/**
 * Whether to generate package preview
 */
export function isReportMode(): boolean {
	return process.env.VITE_REPORT === "true";
}

// Read all environment variable configuration files to process.env
export function wrapperEnv(envConf: Recordable): ViteEnv {
	// 保存当前校验或转换过程的返回值。
	const ret: any = {};

	// envName 表示当前转换的环境变量键名。
	for (const envName of Object.keys(envConf)) {
		// 移除环境变量键中的 VITE 前缀。
		let realName = envConf[envName].replace(/\\n/g, "\n");
		realName = realName === "true" ? true : realName === "false" ? false : realName;

		if (envName === "VITE_PORT") {
			realName = Number(realName);
		}
		if (envName === "VITE_PROXY") {
			try {
				realName = JSON.parse(realName);
			} catch (error) {
				// error 表示代理配置不是有效 JSON 的解析异常。
				console.log(error);
			}
		}
		ret[envName] = realName;
		process.env[envName] = realName;
	}
	return ret;
}

/**
 * Get the environment variables starting with the specified prefix
 * @param match prefix
 * @param confFiles ext
 */
export function getEnvConfig(match = "VITE_GLOB_", confFiles = [".env", ".env.production"]) {
	// 汇总环境文件解析得到的配置。
	let envConfig = {};
	confFiles.forEach(
		/* 遍历当前集合并处理每一项。 */ item => {
			try {
				// 读取当前运行模式的环境变量。
				const env = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), item)));
				envConfig = { ...envConfig, ...env };
			} catch (error) {
				// error 表示当前环境文件读取或解析失败的异常。
				console.error(`Error in parsing ${item}`, error);
			}
		}
	);

	Object.keys(envConfig).forEach(
		/* 遍历当前集合并处理每一项。 */ key => {
			// 构造用于移除环境变量前缀的正则表达式。
			const reg = new RegExp(`^(${match})`);
			if (!reg.test(key)) {
				Reflect.deleteProperty(envConfig, key);
			}
		}
	);
	return envConfig;
}

/**
 * Get user root directory
 * @param dir file path
 */
export function getRootPath(...dir: string[]) {
	return path.resolve(process.cwd(), ...dir);
}
