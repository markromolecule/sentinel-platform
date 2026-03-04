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
exports.examConfigFormSchema = void 0;
const z = __importStar(require("zod"));
exports.examConfigFormSchema = z.object({
    name: z.string().min(2, {
        message: 'Policy name must be at least 2 characters.',
    }),
    allowedDevices: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: 'You have to select at least one device.',
    }),
    cameraRequired: z.boolean().default(false),
    micRequired: z.boolean().default(false),
    aiRules: z.object({
        web: z.object({
            gazeTracking: z.boolean().default(false),
            audioDetection: z.boolean().default(false),
            tabSwitching: z.boolean().default(false),
            copyPaste: z.boolean().default(false),
            printScreenDisable: z.boolean().default(false),
        }),
        mobile: z.object({
            gazeTracking: z.boolean().default(false),
            audioDetection: z.boolean().default(false),
            appPinning: z.boolean().default(false),
            screenshotDisable: z.boolean().default(false),
        }),
    }),
    maxReconnectAttempts: z.coerce.number().min(1).max(10),
    autoSubmitTimeout: z.coerce.number().min(1).max(60),
});
//# sourceMappingURL=ExamConfigSchema.js.map