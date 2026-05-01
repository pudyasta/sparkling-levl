// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Simple case for displaying a toast.
 */
export interface PickFileRequest {
  type: string[];
  callback?: void;
}

export interface PickFileResponse {
  value: any;
}

/**
 * pickFile method
 * @param params - The request parameters
 * @param callback - Callback function to handle the response
 */
declare function pickFile(params: PickFileRequest, callback: (result: PickFileResponse) => void): void;