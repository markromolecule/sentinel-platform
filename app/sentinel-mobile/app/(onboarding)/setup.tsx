import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { INSTITUTIONS, DEPARTMENTS, COURSES } from '@/data/onboarding';
import { SelectionModalProps, SelectionItem } from '@/types/onboarding/selection-item';
import { StatusBar } from 'expo-status-bar';
import styles from './styles/setup';
import { Colors } from '@/constants/theme';

export default function OnboardingSetup() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [institution, setInstitution] = useState<SelectionItem | null>(null);
    const [department, setDepartment] = useState<SelectionItem | null>(null);
    const [course, setCourse] = useState<SelectionItem | null>(null);

    const [showInstModal, setShowInstModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);

    const handleComplete = () => {
        // Mock submission
        console.log({
            firstName,
            lastName,
            studentNo,
            institutionId: institution?.id,
            departmentId: department?.id,
            courseId: course?.id,
        });
        router.replace('/(tabs)/exam');
    };

    const isFormValid =
        firstName.trim() &&
        lastName.trim() &&
        studentNo.length >= 9 &&
        institution &&
        department &&
        course;

    const handleStudentNumberChange = (text: string) => {
        const raw = text.replace(/\D/g, '');
        let formatted = raw;
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 4)}-${raw.slice(4, 12)}`;
        }
        setStudentNo(formatted);
    };

    const handleInstitutionSelect = (item: SelectionItem) => {
        setInstitution(item);
        setDepartment(null);
        setCourse(null);
    };

    const handleDepartmentSelect = (item: SelectionItem) => {
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

                <View
                    style={[
                        styles.footer,
                        { paddingBottom: Math.max(insets.bottom, 24) },
                    ]}
                >
                    <TouchableOpacity
                        style={[styles.button, !isFormValid && styles.buttonDisabled]}
                        onPress={handleComplete}
                        disabled={!isFormValid}
                    >
                        <Text style={styles.buttonText}>Complete Setup</Text>
                    </TouchableOpacity>
                </View>

                <SelectionModal
                    visible={showInstModal}
                    onClose={() => setShowInstModal(false)}
                    data={INSTITUTIONS}
                    onSelect={handleInstitutionSelect}
                    title="Institution"
                />
                <SelectionModal
                    visible={showDeptModal}
                    onClose={() => setShowDeptModal(false)}
                    data={DEPARTMENTS}
                    onSelect={handleDepartmentSelect}
                    title="Department"
                />
                <SelectionModal
                    visible={showCourseModal}
                    onClose={() => setShowCourseModal(false)}
                    data={COURSES}
                    onSelect={setCourse}
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
            item.code.toLowerCase().includes(search.toLowerCase()),
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
