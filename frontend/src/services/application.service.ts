import instance from "../config/api";
import { type ApplicationStatus } from "../lib/types";

class ApplicationService{
    async submit(formData: FormData){
        return await instance.post('/applications', formData)
    }

    async getApplications(status?: ApplicationStatus) {
        return await instance.get(`/applications?status=${status ?? ""}`);
    }

    async getApplicationById(applicationId: string) {
        return await instance.get(`/applications/${applicationId}`);
    }

    async updateDecision(applicationId: string, status: ApplicationStatus) {
        return await instance.patch(`/applications/${applicationId}/decision`, { status });
    }
}

export const applicationService = new ApplicationService();