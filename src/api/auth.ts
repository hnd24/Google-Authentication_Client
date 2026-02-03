import api from '@/lib/axios';

// Làm sạch API_URL để tránh lỗi lặp cổng hoặc dư dấu gạch chéo
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Mở Popup Google để thực hiện đăng nhập OAuth2
 */
export const openGooglePopup = (): Promise<string> => {
	return new Promise((resolve, reject) => {
		const width = 500;
		const height = 600;
		const left = window.screen.width / 2 - width / 2;
		const top = window.screen.height / 2 - height / 2;

		const popup = window.open(
			`${API_URL}/auth/login`,
			'Google Login',
			`width=${width},height=${height},left=${left},top=${top}`,
		);

		const handleMessage = (event: MessageEvent) => {
			// Chỉ chấp nhận tin nhắn từ nguồn API tin cậy
			if (event.origin !== API_URL) return;

			if (event.data.type === 'AUTH_SUCCESS') {
				window.removeEventListener('message', handleMessage);
				resolve(event.data.access_token);
			}
		};

		window.addEventListener('message', handleMessage);

		// Kiểm tra định kỳ nếu popup bị đóng thủ công bởi người dùng
		const timer = setInterval(() => {
			try {
				if (popup?.closed) {
					clearInterval(timer);
					reject(new Error('Cửa sổ đăng nhập đã bị đóng'));
				}
			} catch (e) {
				// Bỏ qua lỗi COOP nếu trình duyệt chặn truy cập thuộc tính 'closed'
			}
		}, 1000);
	});
};

/**
 * Gửi yêu cầu đăng xuất tới Server để vô hiệu hóa Token và xóa Cookie
 */
export const logoutApi = async () => {
	return await api.post('/auth/logout');
};

/**
 * Gọi API làm mới Access Token dựa trên Refresh Token lưu trong Http-only Cookie
 * Trả về access_token mới để cập nhật vào Zustand Store.
 */
export const refreshAccessTokenApi = async (): Promise<{access_token: string}> => {
	const {data} = await api.post('/auth/refresh');
	return data;
};
