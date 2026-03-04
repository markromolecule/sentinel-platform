"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SECTION_STORE_STATE = exports.MOCK_SECTIONS_LOCAL = void 0;
const mock_data_1 = require("../../../mock-data");
// We need to match the type expected by SectionStoreState which might expect full Section objects
// But MOCK_SECTIONS in shared might be Omit<Section, "status"> or full Section.
// In mock-data/index.ts I exported MOCK_SECTIONS as Omit<Section, "status">[].
// The SectionStoreState expects Section[].
// I'll need to map it to add status if missing, or update MOCK_SECTIONS in shared to have status.
// A simpler way:
exports.MOCK_SECTIONS_LOCAL = mock_data_1.MOCK_SECTIONS.map(s => ({
    ...s,
    courseId: s.courseId,
    status: "active"
}));
exports.DEFAULT_SECTION_STORE_STATE = {
    sections: exports.MOCK_SECTIONS_LOCAL,
};
//# sourceMappingURL=index.js.map