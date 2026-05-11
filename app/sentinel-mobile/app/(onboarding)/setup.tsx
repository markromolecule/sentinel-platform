import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    useAuth,
    useOnboardingCoursesQuery,
    useOnboardingDepartmentsQuery,
    useOnboardingInstitutionsQuery,
    useOnboardingMutation,
} from '@sentinel/hooks';
import { onboardingSchema } from '@sentinel/shared/schema';
import type { Course, Department, Institution } from '@sentinel/shared/types';
import { SelectionModalProps, SelectionItem } from '@/types/onboarding/selection-item';
import { StatusBar } from 'expo-status-bar';
import styles from './styles/setup';
import { Colors } from '@/constants/theme';

type OnboardingFeedback = {
    title: string;
    description: string;
    hints?: string[];
};

function createValidationFeedback(message: string): OnboardingFeedback {
    return {
        title: 'Check your details',
        description: message,
    };
}

function mapOnboardingError(message: string): OnboardingFeedback {
    if (message.includes('Student number is not approved')) {
        return {
            title: 'Student record not found',
            description:
                'We could not find an approved onboarding record for that student number in the institution you selected.',
            hints: [
                'Check that your student number is correct.',
                'Make sure you selected the correct institution.',
                'If the details are correct, ask your registrar or program chair to whitelist your record first.',
            ],
        };
    }

    if (message.includes('Last name does not match')) {
        return {
            title: 'Last name did not match',
            description:
                'Your last name must match the approved whitelist record before onboarding can continue.',
            hints: [
                'Use your official last name exactly as recorded by your school.',
                'Spacing differences are ignored, but the surname still needs to match.',
            ],
        };
    }

    if (message.includes('Department does not match')) {
        return {
            title: 'Department does not match',
            description:
                'The selected department does not match the approved whitelist record for your student account.',
            hints: [
                'Select the department tied to your official student record.',
                'If you recently shifted programs, ask an admin to update your whitelist first.',
            ],
        };
    }

    if (message.includes('Course does not match')) {
        return {
            title: 'Course does not match',
            description:
                'The selected course does not match the approved whitelist record for your student account.',
            hints: [
                'Choose your official program, not just a subject you are currently taking.',
                'Irregular and cross-department subjects do not change your whitelist course.',
            ],
        };
    }

    if (
        message.includes('claimed by another account') ||
        message.includes('already registered to another account')
    ) {
        return {
            title: 'This student record is already linked',
            description:
                'That whitelist record has already been claimed by another account, so onboarding cannot continue from this one.',
            hints: [
                'Try signing in with the account that originally completed onboarding.',
                'If this is a mistake, contact an admin or superadmin for assistance.',
            ],
        };
    }

    if (message.includes('not active')) {
        return {
            title: 'Whitelist record is inactive',
            description:
                'Your student whitelist record is currently inactive, so onboarding is temporarily blocked.',
            hints: ['Please contact your admin or registrar to reactivate your record.'],
        };
    }

    if (message.includes('Student profile already exists')) {
        return {
            title: 'Profile already completed',
            description:
                'This account already has a student profile, so onboarding does not need to be submitted again.',
        };
    }

    return {
        title: 'Unable to complete onboarding',
        description: message || 'Something went wrong while verifying your student details.',
        hints: [
            'Review your student number and selected academic information.',
            'If the problem continues, contact your admin or registrar.',
        ],
    };
}

function mapInstitutionToSelectionItem(institution: Institution): SelectionItem {
    return {
        id: institution.id,
        code: institution.code ?? '',
        name: institution.name,
    };
}

function mapDepartmentToSelectionItem(department: Department): SelectionItem {
    return {
        id: department.id,
        code: department.code ?? '',
        name: department.name,
    };
}

function mapCourseToSelectionItem(course: Course): SelectionItem {
    return {
        id: course.id,
        code: course.code,
        name: course.title,
    };
}

export default function OnboardingSetup() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [institution, setInstitution] = useState<SelectionItem | null>(null);
    const [department, setDepartment] = useState<SelectionItem | null>(null);
    const [course, setCourse] = useState<SelectionItem | null>(null);
    const [feedback, setFeedback] = useState<OnboardingFeedback | null>(null);

    const [showInstModal, setShowInstModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);

    const { data: institutions = [], isLoading: isLoadingInstitutions } =
        useOnboardingInstitutionsQuery();
    const { data: departments = [], isLoading: isLoadingDepartments } =
        useOnboardingDepartmentsQuery(institution?.id);
    const { data: courses = [], isLoading: isLoadingCourses } = useOnboardingCoursesQuery(
        department?.id,
        institution?.id,
    );
    const onboardingMutation = useOnboardingMutation({
        onSuccess: () => {
            router.replace('/(tabs)/classroom');
        },
        onError: (error) => {
            setFeedback(mapOnboardingError(error.message));
        },
    });

    useEffect(() => {
        const metadata = user?.user_metadata;

        if (!metadata) {
            return;
        }

        if (metadata.full_name && (!firstName || !lastName)) {
            const parts = String(metadata.full_name).trim().split(/\s+/);
            if (!firstName && parts[0]) {
                setFirstName(parts[0]);
            }
            if (!lastName && parts.length > 1) {
                setLastName(parts.slice(1).join(' '));
            }
        }

        if (!firstName && typeof metadata.first_name === 'string') {
            setFirstName(metadata.first_name);
        }

        if (!lastName && typeof metadata.last_name === 'string') {
            setLastName(metadata.last_name);
        }
    }, [user, firstName, lastName]);

    const institutionOptions = useMemo(
        () => institutions.map(mapInstitutionToSelectionItem),
        [institutions],
    );
    const departmentOptions = useMemo(
        () => departments.map(mapDepartmentToSelectionItem),
        [departments],
    );
    const courseOptions = useMemo(() => courses.map(mapCourseToSelectionItem), [courses]);

    const handleComplete = () => {
        setFeedback(null);

        const payload = {
            firstName,
            lastName,
            studentNumber: studentNo,
            institutionId: institution?.id,
            departmentId: department?.id,
            courseId: course?.id,
        };

        const result = onboardingSchema.safeParse(payload);

        if (!result.success) {
            setFeedback(
                createValidationFeedback(result.error.issues[0]?.message || 'Invalid data'),
            );
            return;
        }

        onboardingMutation.mutate(result.data);
    };

    const isFormValid =
        firstName.trim() &&
        lastName.trim() &&
        studentNo.length >= 9 &&
        institution &&
        department &&
        course;

    const handleStudentNumberChange = (text: string) => {
        setFeedback(null);
        const raw = text.replace(/\D/g, '');
        let formatted = raw;
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 4)}-${raw.slice(4, 12)}`;
        }
        setStudentNo(formatted);
    };

    const handleInstitutionSelect = (item: SelectionItem) => {
        setFeedback(null);
        setInstitution(item);
        setDepartment(null);
        setCourse(null);
    };

    const handleDepartmentSelect = (item: SelectionItem) => {
        setFeedback(null);
        setDepartment(item);
        setCourse(null);
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
            <StatusBar style="dark" />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Complete Profile</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {feedback ? (
                        <View style={styles.feedbackCard}>
                            <Text style={styles.feedbackTitle}>{feedback.title}</Text>
                            <Text style={styles.feedbackDescription}>{feedback.description}</Text>
                            {feedback.hints?.map((hint) => (
                                <Text key={hint} style={styles.feedbackHint}>
                                    {`\u2022 ${hint}`}
                                </Text>
                            ))}
                        </View>
                    ) : null}

                    <View style={styles.alert}>
                        <Ionicons name="shield-checkmark" size={24} color={Colors.light.primary} />
                        <View style={styles.alertDescription}>
                            <Text style={styles.alertTitle}>Verification Rules</Text>
                            <Text style={styles.alertDescription}>
                                Your profile will be checked against the official student whitelist.
                                Ensure all details are accurate.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Juan"
                            placeholderTextColor={Colors.light.icon}
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Dela Cruz"
                            placeholderTextColor={Colors.light.icon}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Academic Information</Text>

                    <Text style={styles.label}>Institution</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowInstModal(true)}
                    >
                        <Text style={institution ? styles.inputText : styles.placeholderText}>
                            {institution ? institution.name : 'Select Institution'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={Colors.light.icon} />
                    </TouchableOpacity>
                    {isLoadingInstitutions ? (
                        <ActivityIndicator
                            size="small"
                            color={Colors.light.primary}
                            style={styles.loadingIndicator}
                        />
                    ) : null}

                    <Text style={styles.label}>Department</Text>
                    <TouchableOpacity
                        style={[styles.dropdown, !institution && styles.dropdownDisabled]}
                        onPress={() => institution && setShowDeptModal(true)}
                        disabled={!institution}
                    >
                        <Text style={department ? styles.inputText : styles.placeholderText}>
                            {department ? department.name : 'Select Department'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={Colors.light.icon} />
                    </TouchableOpacity>
                    {isLoadingDepartments ? (
                        <ActivityIndicator
                            size="small"
                            color={Colors.light.primary}
                            style={styles.loadingIndicator}
                        />
                    ) : null}

                    <Text style={styles.label}>Course</Text>
                    <TouchableOpacity
                        style={[styles.dropdown, !department && styles.dropdownDisabled]}
                        onPress={() => department && setShowCourseModal(true)}
                        disabled={!department}
                    >
                        <Text style={course ? styles.inputText : styles.placeholderText}>
                            {course ? course.name : 'Select Course'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={Colors.light.icon} />
                    </TouchableOpacity>
                    {isLoadingCourses ? (
                        <ActivityIndicator
                            size="small"
                            color={Colors.light.primary}
                            style={styles.loadingIndicator}
                        />
                    ) : null}

                    <Text style={styles.label}>Student Number</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="2023-123456"
                            placeholderTextColor={Colors.light.icon}
                            value={studentNo}
                            onChangeText={handleStudentNumberChange}
                            keyboardType="numeric"
                            maxLength={13}
                        />
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!isFormValid || onboardingMutation.isPending) && styles.buttonDisabled,
                        ]}
                        onPress={handleComplete}
                        disabled={!isFormValid || onboardingMutation.isPending}
                    >
                        {onboardingMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Complete Setup</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <SelectionModal
                    visible={showInstModal}
                    onClose={() => setShowInstModal(false)}
                    data={institutionOptions}
                    onSelect={handleInstitutionSelect}
                    title="Institution"
                />
                <SelectionModal
                    visible={showDeptModal}
                    onClose={() => setShowDeptModal(false)}
                    data={departmentOptions}
                    onSelect={handleDepartmentSelect}
                    title="Department"
                />
                <SelectionModal
                    visible={showCourseModal}
                    onClose={() => setShowCourseModal(false)}
                    data={courseOptions}
                    onSelect={(item) => {
                        setFeedback(null);
                        setCourse(item);
                    }}
                    title="Course"
                />
            </View>
        </View>
    );
}

function SelectionModal({ visible, onClose, data, onSelect, title }: SelectionModalProps) {
    const [search, setSearch] = useState('');

    const filteredData = data.filter(
        (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.code ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.light.icon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${title.toLowerCase()}...`}
                            placeholderTextColor={Colors.light.icon}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                    setSearch('');
                                }}
                            >
                                <Text style={styles.modalItemText}>{item.name}</Text>
                                <Text style={styles.modalItemSubtext}>{item.code}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No results found</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </View>
            </View>
        </Modal>
    );
}
