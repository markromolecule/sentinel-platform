export type WebFieldName =
    | 'aiRules.web.gazeTracking'
    | 'aiRules.web.audioDetection'
    | 'aiRules.web.tabSwitching'
    | 'aiRules.web.copyPaste'
    | 'aiRules.web.printScreenDisable';

export type MobileFieldName =
    | 'aiRules.mobile.gazeTracking'
    | 'aiRules.mobile.audioDetection'
    | 'aiRules.mobile.appPinning'
    | 'aiRules.mobile.screenshotDisable';

export type RuleItem = {
    name: WebFieldName | MobileFieldName;
    label: string;
    description: string;
};
