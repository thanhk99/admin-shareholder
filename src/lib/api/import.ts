import apiClient from "../api-client";

export class ImportService {
    static api_base = "/api/import";

    static importShareholders = async (meetingId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            return apiClient.post(`${this.api_base}/${meetingId}/shareholders`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error) {
            throw error;
        }
    };

    static importProxies = async (meetingId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            return apiClient.post(`${this.api_base}/${meetingId}/proxies`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error) {
            throw error;
        }
    };
}
