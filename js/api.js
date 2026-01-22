export const API_BASE_URL = 'http://localhost:8000';

/**
 * 표준 API 요청 함수
 * 백엔드의 StandardResponse 포맷(code, message, data, details)을 처리합니다.
 */
export const request = async (url, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        
        // 204 No Content 처리
        if (response.status === 204) return null;
        
        const result = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            // 백엔드 에러 응답 처리 (StandardResponse 포맷)
            const errorMessage = result.message || 'API 요청에 실패했습니다.';
            const error = new Error(errorMessage);
            error.code = result.code;
            error.details = result.details;
            throw error;
        }
        
        // 성공 시 data 필드 반환 (StandardResponse 포맷)
        return result.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
