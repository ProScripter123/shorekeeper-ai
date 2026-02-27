import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon, Wand2, Download, RefreshCcw } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getGeminiModel, fileToGenerativePart } from '../utils/gemini';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function EditImageScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [editedImageDescription, setEditedImageDescription] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setEditedImageDescription(null);
        }
    };

    const processImage = async () => {
        if (!image || loading) return;

        setLoading(true);
        try {
            const model = await getGeminiModel();
            const imagePart = await fileToGenerativePart(image, 'image/jpeg');

            const prompt = "Act as an image editor. Analyze this image and describe how you would 'enhance' it aesthetically. Provide a creative, detailed description of the edited version. Start with 'I have processed the image: '";

            const result = await model.generateContent([prompt, imagePart as any]);
            setEditedImageDescription(result.response.text());
        } catch (error) {
            console.error(error);
            alert('Failed to process image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Image Editor</Text>
                <Text style={styles.subtitle}>Enhance your photos with AI</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {!image ? (
                    <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
                        <ImageIcon size={48} color="#3b82f6" />
                        <Text style={styles.uploadText}>Tap to Select Image</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                                <RefreshCcw size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Change</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.processButton, loading && styles.disabled]}
                                onPress={processImage}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Wand2 size={20} color="#fff" />
                                        <Text style={styles.actionButtonText}>Enhance AI</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {editedImageDescription && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultLabel}>AI Enhancement Analysis:</Text>
                                <Text style={styles.resultText}>{editedImageDescription}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    content: {
        padding: 16,
    },
    uploadPlaceholder: {
        height: 300,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    uploadText: {
        color: '#94a3b8',
        marginTop: 12,
        fontSize: 16,
    },
    imageContainer: {
        marginTop: 20,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 24,
        backgroundColor: '#000',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    processButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabled: {
        opacity: 0.5,
    },
    resultBox: {
        marginTop: 24,
        padding: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    resultLabel: {
        color: '#3b82f6',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    resultText: {
        color: '#cbd5e1',
        lineHeight: 22,
    },
});
