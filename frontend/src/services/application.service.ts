import instance from "../config/api";
import { type ApplicationStatus } from "../lib/types";

class ApplicationService{
    submit(formData: FormData){
        return instance.post('/applications', formData)
    }

    getApplications(status?: ApplicationStatus) {
        return instance.get(`/applications?status=${status ?? ""}`);
    }

    getApplicationById(id: string) {
        return instance.get(`/applications/${id}`);
    }

    updateDecision(id: string, status: ApplicationStatus) {
        return instance.patch(`/applications/${id}/decision`, { status });
    }
}

export const applicationService = new ApplicationService();