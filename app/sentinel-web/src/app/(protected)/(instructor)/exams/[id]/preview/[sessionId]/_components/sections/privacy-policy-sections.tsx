import { PRIVACY_POLICIES } from '../../_constants/preview-constants';

export function PrivacyPolicySections() {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold sm:text-lg">Policies & terms</h2>
            <div className="space-y-4 text-sm leading-6 sm:text-[15px]">
                {PRIVACY_POLICIES.map((policy) => (
                    <div key={policy.title} className="space-y-1.5">
                        <p className="text-foreground font-semibold">{policy.title}</p>
                        <div className="text-muted-foreground">{policy.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
