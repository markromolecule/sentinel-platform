import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles/start';

const { width, height } = Dimensions.get('window');

export default function OnboardingIntro() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Hero Section - 60% height */}
            <View style={styles.heroContainer}>
                {/* Background Gradient */}
                <LinearGradient
                    colors={[Colors.light.primary, Colors.light.primary + '80', 'transparent']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.imageWrapper}>
                    <Image
                        source={require('@/assets/images/sentinel-character.png')}
                        style={styles.characterImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Content Card - Overlaps the hero section */}
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <View style={styles.textSection}>
                        <Text style={styles.title}>Welcome to Sentinel</Text>
                        <Text style={styles.description}>
                            Your comprehensive academic companion. Secure, transparent, and always
                            by your side.
                        </Text>
                    </View>

                    <View style={styles.featureContainer}>
                        <View style={styles.featureRow}>
                            <View style={styles.iconWrapper}>
                                <Ionicons
                                    name="shield-checkmark"
                                    size={20}
                                    color={Colors.light.primary}
                                />
                            </View>
                            <Text style={styles.featureText}>Academic Integrity Guaranteed</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="school" size={20} color={Colors.light.primary} />
                            </View>
                            <Text style={styles.featureText}>Seamless Institution Sync</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/(onboarding)/terms')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color="#fff"
                            style={styles.buttonIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
