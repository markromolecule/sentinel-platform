"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SUBJECT_STORE_STATE = exports.SUBJECT_QUERY_KEYS = exports.MOCK_MASTER_SUBJECTS = exports.MOCK_SUBJECTS = void 0;
var mock_data_1 = require("../../../mock-data");
Object.defineProperty(exports, "MOCK_SUBJECTS", { enumerable: true, get: function () { return mock_data_1.MOCK_SUBJECTS; } });
Object.defineProperty(exports, "MOCK_MASTER_SUBJECTS", { enumerable: true, get: function () { return mock_data_1.MOCK_MASTER_SUBJECTS; } });
const mock_data_2 = require("../../../mock-data");
exports.SUBJECT_QUERY_KEYS = {
    all: ['subjects'],
    details: (id) => ['subjects', id],
};
exports.DEFAULT_SUBJECT_STORE_STATE = {
    subjects: mock_data_2.MOCK_SUBJECTS,
    masterSubjects: mock_data_2.MOCK_MASTER_SUBJECTS,
};
//# sourceMappingURL=index.js.map