import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import styles from './styles/terms';

export default function OnboardingPrivacy() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [accepted, setAccepted] = useState(false);

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
            <StatusBar style="dark" />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.paragraph}>Last updated: May 4, 2026</Text>

                    <Text style={styles.paragraph}>
                        At Sentinel, we are committed to protecting your privacy and ensuring the
                        security of your personal information. This Privacy Policy outlines how we
                        collect, use, disclose, and safeguard your data.
                    </Text>

                    <Text style={styles.sectionTitle}>1. Data Privacy Act of 2012</Text>
                    <Text style={styles.paragraph}>
                        We strictly adhere to the Data Privacy Act of 2012 of the Philippines. We
                        are dedicated to upholding your rights as a data subject, including your
                        right to be informed, object, access, and rectification.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        • Personal Information: Name, student ID, email, and institutional
                        affiliation.{'\n'}• Biometric Data: Facial data for gaze tracking and
                        identity verification.
                        {'\n'}• Audio Data: Audio recordings from your microphone during exam
                        monitoring.
                        {'\n'}• Device Information: Device type, operating system, and browser
                        version.
                    </Text>

                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        Your data is used solely for the purpose of maintaining examination
                        integrity:{'\n'}• Verifying your identity before and during assessments.
                        {'\n'}• Monitoring exam sessions for potential academic dishonesty.{'\n'}•
                        Generating reports for proctors and educators.{'\n'}• Improving the accuracy
                        of our security algorithms.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We implement strict security measures to protect your data. All sensitive
                        information is encrypted in transit and at rest. Access is strictly limited
                        to authorized proctors and administrators.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Data Retention</Text>
                    <Text style={styles.paragraph}>
                        We retain your personal data only for as long as necessary to fulfill the
                        purposes for which it was collected, or as required by law or your
                        institution's policy.
                    </Text>

                    <View style={styles.spacing} />
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAccepted(!accepted)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                            {accepted && <Ionicons name="checkmark" size={18} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the collection and processing of my data as described above.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, !accepted && styles.buttonDisabled]}
                        onPress={() => accepted && router.push('/(onboarding)/setup')}
                        disabled={!accepted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Accept & Finish</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
