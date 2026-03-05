"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SECTION_STORE_STATE = exports.MOCK_SECTIONS_LOCAL = exports.SECTION_QUERY_KEYS = void 0;
const mock_data_1 = require("../../../mock-data");
exports.SECTION_QUERY_KEYS = {
    all: ['sections'],
    details: (id) => ['sections', id],
};
exports.MOCK_SECTIONS_LOCAL = mock_data_1.MOCK_SECTIONS;
exports.DEFAULT_SECTION_STORE_STATE = {
    sections: exports.MOCK_SECTIONS_LOCAL,
};
//# sourceMappingURL=index.js.map