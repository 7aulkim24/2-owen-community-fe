export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const validateEmail = (email) => emailRegex.test(email);
export const validatePassword = (password) => passwordRegex.test(password);
export const validateNickname = (nickname) => {
    if (nickname.includes(' ')) return { valid: false, message: '*띄어쓰기를 없애주세요' };
    if (nickname.length > 10) return { valid: false, message: '*닉네임은 최대 10자 까지 작성 가능합니다.' };
    return { valid: true, message: '' };
};
