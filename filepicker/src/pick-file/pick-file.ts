import pipe from 'org.sparkling';
import type { PickFileRequest, PickFileResponse } from './pickFile.d';

/**
 * pickFile method
 * @param params - The request parameters
 * @param callback - Callback function to handle the response
 * @throws Will call callback with error if type validation fails
 */
export function pickFile(params: PickFileRequest, callback: (result: PickFileResponse) => void): void {
    // Parameter validation
    if (!params) {
        const errorResponse: PickFileResponse = {
            code: -1,
            msg: 'Invalid params: params cannot be null or undefined',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    // type-check validation for type
    if (!params.type || typeof params.type !== 'object') {
        const errorResponse:  = {
            code: -1,
            msg: 'Invalid params: type must be of type object',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    // Callback validation
    if (typeof callback !== 'function') {
        console.error('[Filepicker] pickFile: callback must be a function');
        return;
    }

    // Pipe call
    pipe.call('Filepicker.pickFile', {
        type: params.type,
        callback: params.callback,
    }, (v: unknown) => {
        // Type assertion and response normalization
        const response = v as PickFileResponse;
        const code = response?.code ?? -1;
        // Pipe status codes: 1 = succeeded, 0 = failed, negative = various errors.
        // When the native side reports success it may omit `msg`, so fall back to
        // 'ok' instead of the misleading 'Unknown error'.
        const isSuccess = code === 1;
        const msg = response?.msg ?? (isSuccess ? 'ok' : 'Unknown error');
        callback({
            code,
            msg,
        });
    });
}