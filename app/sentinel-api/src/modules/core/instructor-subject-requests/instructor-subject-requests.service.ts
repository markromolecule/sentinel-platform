import { listRequests, getRequestById } from './services/instructor-subject-requests-query.service';
import {
    submitRequest,
    reviewRequest,
    cancelRequest,
} from './services/instructor-subject-requests-write.service';

export class InstructorSubjectRequestsService {
    static submitRequest = submitRequest;
    static reviewRequest = reviewRequest;
    static cancelRequest = cancelRequest;
    static listRequests = listRequests;
    static getRequestById = getRequestById;
}
