import { getErrorMessage, getSuccessMessage } from './error-messages.js';

// API 베이스 URL 설정
// 브라우저의 현재 호스트명에 맞춰 localhost 또는 127.0.0.1을 유연하게 선택합니다.
const currentHost = window.location.hostname;
export const API_BASE_URL = `http://${currentHost === 'localhost' || currentHost === '127.0.0.1' ? currentHost : 'localhost'}:8000`;

// 표준 API 요청 함수
// 백엔드의 StandardResponse 포맷(code, message, data, details)을 처리합니다.
export const request = async (url, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            credentials: 'include', // 세션 쿠키 포함을 위해 필수
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
        
        // 성공 시 데이터와 코드 함께 반환 (StandardResponse 포맷 대응)
        return {
            data: result.data,
            code: result.code
        };
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Load failed') {
            console.error('Network Error: 서버에 연결할 수 없거나 CORS 정책에 의해 차단되었습니다. (URL:', `${API_BASE_URL}${url}`, ')');
        } else {
            console.error('API Error:', error);
        }
        throw error;
    }
};

/**
 * 전역 토스트 메시지 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success', 'error' 등 (기본: 'success')
 */
export const showToast = (message, type = 'success') => {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // 다음 프레임에서 show 클래스 추가하여 애니메이션 작동
    setTimeout(() => toast.classList.add('show'), 10);

    // 3초 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

/**
 * 공통 API 에러 처리 함수
 * @param {Error} error - 에러 객체
 * @param {HTMLElement} formElement - 에러 메시지를 표시할 폼 요소 (선택사항)
 */
export const handleApiError = (error, formElement = null) => {
    // 네트워크 에러 (fetch 실패 등)
    if (!error.code) {
        const networkMsg = '네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.';
        showToast(networkMsg, 'error');
        return networkMsg;
    }

    // 에러 코드 기반 메시지 조회
    const message = getErrorMessage(error.code, error.message);

    // 인증 오류 처리 (401 Unauthorized 등)
    if (error.code === 'UNAUTHORIZED' || error.code === 'INVALID_SESSION') {
        showToast(message, 'error');
        // 세션 만료 시 로그인 페이지로 리다이렉트
        setTimeout(() => {
            window.location.href = '/pages/auth/login.html';
        }, 1500);
        return message;
    }

    // 백엔드 검증 에러 처리 (Pydantic ValidationError 등)
    if (error.details && typeof error.details === 'object' && formElement) {
        Object.entries(error.details).forEach(([field, messages]) => {
            const helperElement = formElement.querySelector(`#${field}-helper`) || 
                                formElement.querySelector(`[data-field="${field}"] .helper-text`);
            
            if (helperElement) {
                const displayMsg = Array.isArray(messages) ? messages[0] : messages;
                helperElement.textContent = `*${displayMsg}`;
                helperElement.style.color = '#e74c3c';
            }
        });
    }

    // 일반 에러 메시지 토스트 표시
    showToast(message, 'error');
    return message;
};

/**
 * 공통 API 성공 처리 함수
 * @param {Object} response - API 응답 객체 { data, code }
 * @param {boolean|string} successMsgOrShowToast - 표시할 메시지(string) 또는 토스트 표시 여부(boolean)
 * @returns {string} 매핑된 성공 메시지
 */
export const handleApiSuccess = (response, successMsgOrShowToast = true) => {
    let message;
    
    if (typeof successMsgOrShowToast === 'string') {
        // 출처(호출부)에서 직접 메시지를 지정한 경우
        message = successMsgOrShowToast;
        showToast(message, 'success');
    } else {
        // 기본 매핑된 메시지 사용
        message = getSuccessMessage(response.code);
        if (successMsgOrShowToast === true) {
            showToast(message, 'success');
        }
    }
    return message;
};

// HTTP 메서드별 편의 함수
export const get = (url) => request(url, { method: 'GET' });
export const post = (url, data) => request(url, {
    method: 'POST',
    body: JSON.stringify(data)
});
export const patch = (url, data) => request(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
});
export const del = (url) => request(url, { method: 'DELETE' });

/**
 * 파일 업로드를 위한 유틸리티 함수
 * @param {string} url - API 엔드포인트
 * @param {File} file - 업로드할 파일 객체
 * @param {string} fieldName - 백엔드에서 기대하는 폼 필드 이름
 * @returns {Promise<any>} - 업로드 결과 (StandardResponse.data)
 */
export const uploadFile = async (url, file, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, file);

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
            // Content-Type 헤더를 설정하지 않아야 브라우저가 자동으로
            // multipart/form-data와 함께 boundary를 설정합니다.
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage = result.message || '파일 업로드에 실패했습니다.';
            const error = new Error(errorMessage);
            error.code = result.code;
            throw error;
        }

        return {
            data: result.data,
            code: result.code
        };
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
};
