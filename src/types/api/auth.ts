/**
 * 认证相关类型定义
 */

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captchaId?: string;
  /** 验证码 */
  captchaCode?: string;
  /** 记住我 */
  rememberMe?: boolean;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  token: string;
}

/**
 * 验证码响应
 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaId: string;
  /** 验证码图片Base64 */
  captchaBase64: string;
}
