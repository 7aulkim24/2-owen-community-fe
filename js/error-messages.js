/**
 * 백엔드 에러 코드별 프론트엔드 표시 메시지 매핑
 * 
 * [출처] docs/community-fe/프론트엔드_에러_처리_가이드.md 및 2-owen-community-be/utils/error_codes.py
 */

export const ERROR_MESSAGES = {
    // --- 공통 및 시스템 에러 ---
    BAD_REQUEST: '잘못된 요청입니다.',
    UNAUTHORIZED: '로그인이 필요합니다.',
    FORBIDDEN: '권한이 없습니다.',
    NOT_FOUND: '요청하신 리소스를 찾을 수 없습니다.',
    METHOD_NOT_ALLOWED: '허용되지 않은 요청 메서드입니다.',
    CONFLICT: '중복된 데이터이거나 리소스 충돌이 발생했습니다.',
    TOO_MANY_REQUEST: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',

    // --- 검증 및 입력 에러 ---
    INVALID_INPUT: '입력 값이 올바르지 않습니다.',
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
    VALIDATION_ERROR: '입력 데이터 검증에 실패했습니다.', // Pydantic 에러용
    
    // --- 상태 에러 ---
    ALREADY_EXISTS: '이미 존재하는 리소스입니다.',
    ALREADY_LOGIN: '이미 로그인된 상태입니다.',

    // --- 리소스 존재 여부 에러 ---
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    POST_NOT_FOUND: '게시글을 찾을 수 없습니다.',
    COMMENT_NOT_FOUND: '댓글을 찾을 수 없습니다.',

    // --- 기타 특수 에러 ---
    POST_ALREADY_LIKED: '이미 좋아요를 누른 게시글입니다.',
    POST_ALREADY_UNLIKED: '좋아요를 누르지 않은 게시글입니다.',
    PAYLOAD_TOO_LARGE: '업로드한 파일의 크기가 너무 큽니다.',
    RATE_LIMIT_EXCEEDED: '요청 빈도가 너무 높습니다. 잠시 후 다시 시도해주세요.',
};

export const SUCCESS_MESSAGES = {
    SUCCESS: '요청이 성공적으로 처리되었습니다.',
    CREATED: '정상적으로 생성되었습니다.',
    UPDATED: '정상적으로 수정되었습니다.',
    DELETED: '정상적으로 삭제되었습니다.',
    LOGIN_SUCCESS: '성공적으로 로그인되었습니다. 환영합니다!',
    SIGNUP_SUCCESS: '회원가입이 완료되었습니다. 로그인을 진행해주세요.',
    LOGOUT_SUCCESS: '성공적으로 로그아웃되었습니다.',
};

/**
 * 에러 코드에 해당하는 메시지를 반환합니다.
 * @param {string} code - 에러 코드
 * @param {string} fallbackMessage - 매핑된 메시지가 없을 경우 사용할 기본 메시지
 * @returns {string}
 */
export const getErrorMessage = (code, fallbackMessage = '알 수 없는 오류가 발생했습니다.') => {
    return ERROR_MESSAGES[code] || fallbackMessage;
};

/**
 * 성공 코드에 해당하는 메시지를 반환합니다.
 * @param {string} code - 성공 코드
 * @returns {string}
 */
export const getSuccessMessage = (code) => {
    return SUCCESS_MESSAGES[code] || SUCCESS_MESSAGES.SUCCESS;
};
