'use client';

import { useCreateUserMutation } from "@sentinel/hooks";
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { UserFormValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';

export interface ParsedUser extends Partial<UserFormValues> {
    id?: string;
    course?: string;
}

export type BulkParseResult = {
    users: ParsedUser[];
    errors: string[];
};

export function useBulkUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<BulkParseResult | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const createMutation = useCreateUserMutation({
        onSuccess: () => {},
        onError: () => {},
    });

    const resetState = useCallback(() => {
        setFile(null);
        setParseResult(null);
        setIsParsing(false);
        setIsImporting(false);
    }, []);

    const parseFile = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setIsParsing(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
                string,
                string | number
            >[];

            if (jsonData.length === 0) {
                setParseResult({
                    users: [],
                    errors: ['File is empty or invalid format'],
                });
                return;
            }

            const users: ParsedUser[] = [];
            const errors: string[] = [];

            jsonData.forEach((row, index) => {
                const rowFirstName = String(
                    row['First Name'] || row['firstname'] || row['Firstname'] || '',
                );
                const rowLastName = String(
                    row['Last Name'] || row['lastname'] || row['Lastname'] || '',
                );
                const rowStudentNo = String(
                    row['StudentID'] ||
                        row['Student Number'] ||
                        row['studentId'] ||
                        row['studentNo'] ||
                        '',
                );
                const rowCourse = String(
                    row['Course'] || row['course'] || row['Department'] || row['department'] || '',
                );
                const rowEmail = String(row['Email'] || row['email'] || '');

                if (!rowFirstName || !rowLastName) {
                    errors.push(`Row ${index + 2}: First Name and Last Name are required`);
                    return;
                }

                // Generate default email if not provided
                const generatedEmail =
                    rowEmail ||
                    (rowStudentNo
                        ? `${rowStudentNo}@student.sentinel.edu`
                        : `${rowFirstName.toLowerCase()}.${rowLastName.toLowerCase()}@sentinel.edu`);

                users.push({
                    firstName: rowFirstName,
                    lastName: rowLastName,
                    studentNo: rowStudentNo,
                    department: rowCourse,
                    email: generatedEmail.toLowerCase(),
                    role: rowStudentNo ? 'student' : 'proctor',
                    institution: 'NU Dasmariñas',
                });
            });

            setParseResult({ users, errors });
        } catch (error) {
            console.error('Parsing error:', error);
            setParseResult({
                users: [],
                errors: ['Failed to parse file. Please ensure it is a valid CSV or Excel file.'],
            });
        } finally {
            setIsParsing(false);
        }
    }, []);

    const importUsers = useCallback(async () => {
        if (!parseResult || parseResult.users.length === 0) return;

        setIsImporting(true);
        let successCount = 0;
        let failCount = 0;

        for (const user of parseResult.users) {
            try {
                await createMutation.mutateAsync(user as UserFormValues);
                successCount++;
            } catch (error) {
                console.error(`Failed to import user ${user.email}:`, error);
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully imported ${successCount} users`);
        }
        if (failCount > 0) {
            toast.error(`Failed to import ${failCount} users`);
        }

        setIsImporting(false);
        resetState();
    }, [parseResult, createMutation, resetState]);

    return {
        file,
        parseResult,
        isParsing,
        isImporting,
        parseFile,
        importUsers,
        resetState,
    };
}
