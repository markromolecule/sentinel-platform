"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = exports.LoginSchema = exports.assignmentFormSchema = exports.sectionSchema = exports.userFormSchema = exports.subjectFormSchema = exports.examConfigFormSchema = exports.departmentSchema = exports.courseSchema = exports.announcementFormSchema = exports.examCreateFormSchema = exports.ProctorExamConfigSchema = exports.AdminExamConfigSchema = void 0;
__exportStar(require("./auth/LoginSchema"), exports);
__exportStar(require("./auth/RegisterSchema"), exports);
__exportStar(require("./users/UserSchema"), exports);
__exportStar(require("./subjects/SubjectSchema"), exports);
__exportStar(require("./announcements/AnnouncementSchema"), exports);
__exportStar(require("./assignments/AssignmentSchema"), exports);
__exportStar(require("./exams/ExamConfigSchema"), exports);
exports.AdminExamConfigSchema = __importStar(require("./admin/exams/configuration/exam-config-schema"));
exports.ProctorExamConfigSchema = __importStar(require("./proctor/exams/configuration/exam-config-schema"));
// Proctor Exams
var exam_create_schema_1 = require("./proctor/exams/exam-create-schema");
Object.defineProperty(exports, "examCreateFormSchema", { enumerable: true, get: function () { return exam_create_schema_1.examCreateFormSchema; } });
// Backported specific exports
var announcement_schema_1 = require("./admin/announcements/announcement-schema");
Object.defineProperty(exports, "announcementFormSchema", { enumerable: true, get: function () { return announcement_schema_1.announcementFormSchema; } });
// Courses
var course_schema_1 = require("./admin/courses/course-schema");
Object.defineProperty(exports, "courseSchema", { enumerable: true, get: function () { return course_schema_1.courseSchema; } });
// Departments
var department_schema_1 = require("./admin/departments/department-schema");
Object.defineProperty(exports, "departmentSchema", { enumerable: true, get: function () { return department_schema_1.departmentSchema; } });
// Exam Configs
var exam_config_schema_1 = require("./admin/exams/configuration/exam-config-schema");
Object.defineProperty(exports, "examConfigFormSchema", { enumerable: true, get: function () { return exam_config_schema_1.examConfigFormSchema; } });
// Subjects
var subject_schema_1 = require("./admin/subjects/subject-schema");
Object.defineProperty(exports, "subjectFormSchema", { enumerable: true, get: function () { return subject_schema_1.subjectFormSchema; } });
// Users
var user_schema_1 = require("./admin/users/user-schema");
Object.defineProperty(exports, "userFormSchema", { enumerable: true, get: function () { return user_schema_1.userFormSchema; } });
// Sections
var section_schema_1 = require("./admin/sections/section-schema");
Object.defineProperty(exports, "sectionSchema", { enumerable: true, get: function () { return section_schema_1.sectionSchema; } });
// Assignments
var AssignmentSchema_1 = require("./assignments/AssignmentSchema");
Object.defineProperty(exports, "assignmentFormSchema", { enumerable: true, get: function () { return AssignmentSchema_1.assignmentFormSchema; } });
var LoginSchema_1 = require("./auth/LoginSchema");
Object.defineProperty(exports, "LoginSchema", { enumerable: true, get: function () { return LoginSchema_1.LoginSchema; } });
var RegisterSchema_1 = require("./auth/RegisterSchema");
Object.defineProperty(exports, "RegisterSchema", { enumerable: true, get: function () { return RegisterSchema_1.RegisterSchema; } });
//# sourceMappingURL=index.js.map