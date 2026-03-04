"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COURSE_QUERY_KEYS = void 0;
// Constants for Course Query Keys
exports.COURSE_QUERY_KEYS = {
    all: ['courses'],
    detail: (id) => [...exports.COURSE_QUERY_KEYS.all, id],
    lists: () => [...exports.COURSE_QUERY_KEYS.all, 'list'],
    list: (filters) => [...exports.COURSE_QUERY_KEYS.lists(), { filters }],
};
//# sourceMappingURL=index.js.map