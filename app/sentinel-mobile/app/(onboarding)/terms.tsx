import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import styles from './styles/terms';

export default function OnboardingTerms() {
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
                    <Text style={styles.headerTitle}>Terms of Service</Text>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.paragraph}>Last updated: May 4, 2026</Text>

                    <Text style={styles.paragraph}>
                        Please read these Terms of Service ("Terms") carefully before using the
                        Sentinel examination security system.
                    </Text>

                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.paragraph}>
                        By accessing or using Sentinel, you agree to be bound by these Terms. If you
                        disagree with any part of the terms, then you may not access the service.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Description of Service</Text>
                    <Text style={styles.paragraph}>
                        Sentinel provides an automated proctoring solution that uses webcam and
                        microphone data to monitor examination integrity. This service is intended
                        for use by educational institutions and their students.
                    </Text>

                    <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
                    <Text style={styles.paragraph}>
                        • Provide accurate and complete information during registration and exam
                        sessions.{'\n'}• Ensure you have necessary hardware (webcam, microphone) and
                        stable internet.{'\n'}• Conduct yourself with academic honesty and integrity
                        during all assessments.{'\n'}• Not attempt to circumvent, disable, or tamper
                        with the security features.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Privacy and Data Collection</Text>
                    <Text style={styles.paragraph}>
                        Your use of Sentinel is also governed by our Privacy Policy. By using the
                        service, you consent to the collection and use of information as detailed in
                        the Privacy Policy, including biometric and audio data processing.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
                    <Text style={styles.paragraph}>
                        The Sentinel service and its original content, features, and functionality
                        are the exclusive property of varying educational partners and licensors.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Termination</Text>
                    <Text style={styles.paragraph}>
                        We may terminate or suspend access to our service immediately, without prior
                        notice or liability, for any reason whatsoever, including breach of the
                        Terms.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
                    <Text style={styles.paragraph}>
                        In no event shall Sentinel be liable for any indirect, incidental, special,
                        or consequential damages resulting from the use or inability to use the
                        service.
                    </Text>

                    <Text style={styles.sectionTitle}>8. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have questions about these Terms, please contact us at
                        support@sentinelph.tech
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
                            I have read and agree to the Terms of Service.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, !accepted && styles.buttonDisabled]}
                        onPress={() => accepted && router.push('/(onboarding)/privacy-policy')}
                        disabled={!accepted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
