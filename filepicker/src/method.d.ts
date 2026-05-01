/** Simple case for displaying a toast. */
export interface FilePickRequest {
  type: string[];
  callback?: void;
}

export interface ShowToastResponse {
  /**
   * @default true
   */
  success: boolean;
}

declare function pickFile(params: FilePickRequest, callback: (result: any) => void): void;
