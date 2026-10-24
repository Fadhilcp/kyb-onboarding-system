import instance from "../config/api";
import { type ApplicationStatus } from "../lib/types";

class ApplicationService{
    async submit(formData: FormData){
        return await instance.post('/applications', formData)
    }

    async getApplications(status?: ApplicationStatus) {
        return await instance.get(`/applications?status=${status ?? ""}`);
    }

    async getApplicationById(id: string) {
        return await instance.get(`/applications/${id}`);
    }

    async updateDecision(id: string, status: ApplicationStatus) {
        return await instance.patch(`/applications/${id}/decision`, { status });
    }
}

export const applicationService = new ApplicationService();