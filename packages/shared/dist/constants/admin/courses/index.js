"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COURSE_STORE_STATE = exports.MOCK_COURSES_LOCAL = exports.COURSE_QUERY_KEYS = void 0;
const mock_data_1 = require("../../../mock-data");
// Constants for Course Query Keys
exports.COURSE_QUERY_KEYS = {
    all: ['courses'],
    detail: (id) => ['courses', id],
    // lists: () => [...COURSE_QUERY_KEYS.all, 'list'] as const,
    // list: (filters: Record<string, string>) => [...COURSE_QUERY_KEYS.lists(), { filters }] as const,
};
exports.MOCK_COURSES_LOCAL = mock_data_1.MOCK_COURSES;
exports.DEFAULT_COURSE_STORE_STATE = {
    courses: exports.MOCK_COURSES_LOCAL,
};
//# sourceMappingURL=index.js.map