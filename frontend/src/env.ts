const API_URL = {
    BACK_END_URL: '/api/v1',
    GET_INFO_ENDPOINT: '/info',
    CREATE_PROFILE_ENDPOINT: '/generate',
    GET_PROFILE_ENDPOINT: '/candidate/get',
    GET_POSITION_ENDPOINT: '/position/get',
    GET_LIST_PROFILE: '/candidate/get-all',
    GET_LIST_POSITION: '/position/get-all'
};

export default API_URL;

export const API_ENDPOINTS = {
    CANDIDATE: {
        GET_ONE: (id: string) => `${API_URL.BACK_END_URL}/candidate/get/${id}`,
        DELETE: (id: string) => `${API_URL.BACK_END_URL}/candidate/delete/${id}`,
        EXPORT: (id: string, format: string) => `${API_URL.BACK_END_URL}/candidate/export/${id}?format=${format}`,
        GET_ALL: `${API_URL.BACK_END_URL}/candidate/get-all`,
    },
    POSITION: {
        GET_ALL: `${API_URL.BACK_END_URL}/position/get-all`,
    },
    MINIO: {
        DOWNLOAD: (fileId: string) => `${API_URL.BACK_END_URL}/minio/download/${fileId}`,
    }
};

export const HOME_ROUTE = '/';