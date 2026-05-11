const fs = require('fs');
let content = fs.readFileSync(
    'src/app/(protected)/(support)/institutions/_components/dialogs/add-institution-dialog.tsx',
    'utf-8',
);
content = content.replace(
    /<FormField\n\s+control=\{form.control\}\n\s+name="parentInstitutionId"/g,
    '<FormField<InstitutionFormValues, "parentInstitutionId">\n                                control={form.control}\n                                name="parentInstitutionId"',
);
content = content.replace(
    /<FormField\n\s+control=\{form.control\}\n\s+name="institutionKind"/g,
    '<FormField<InstitutionFormValues, "institutionKind">\n                            control={form.control}\n                            name="institutionKind"',
);
content = content.replace(
    /<FormField\n\s+control=\{form.control\}\n\s+name="name"/g,
    '<FormField<InstitutionFormValues, "name">\n                            control={form.control}\n                            name="name"',
);
content = content.replace(
    /<FormField\n\s+control=\{form.control\}\n\s+name="code"/g,
    '<FormField<InstitutionFormValues, "code">\n                            control={form.control}\n                            name="code"',
);
fs.writeFileSync(
    'src/app/(protected)/(support)/institutions/_components/dialogs/add-institution-dialog.tsx',
    content,
);
