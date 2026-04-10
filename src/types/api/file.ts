/**
 * File 文件上传类型定义
 */

/** 文件信息 */
export interface FileInfo {
  /** 文件名称 */
  fileName: string;
  /** 文件URL */
  filePath: string;
  // 其他字段
  [key: string]: any;
}
