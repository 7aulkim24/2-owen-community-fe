// 정규표현식
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

// 이메일 유효성 검사
export const validateEmail = (email) => emailRegex.test(email);

// 비밀번호 유효성 검사
export const validatePassword = (password) => passwordRegex.test(password);

// 닉네임 유효성 검사
export const validateNickname = (nickname) => {
    if (nickname.includes(' ')) return { valid: false, message: '*띄어쓰기를 없애주세요' };
    if (nickname.length > 10) return { valid: false, message: '*닉네임은 최대 10자 까지 작성 가능합니다.' };
    return { valid: true, message: '' };
};
