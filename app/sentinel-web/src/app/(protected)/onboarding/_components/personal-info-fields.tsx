import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { PersonalInfoFieldsProps } from "../_types";

export function PersonalInfoFields({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    disabled = false,
}: PersonalInfoFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                    id="firstName"
                    placeholder="e.g. John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[#0f0f10] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    disabled={disabled}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                    id="lastName"
                    placeholder="e.g. Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-[#0f0f10] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
