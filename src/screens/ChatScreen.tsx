import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import { getGeminiModel, fileToGenerativePart } from '../utils/gemini';
import { getUserData, UserData } from '../utils/storage';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    imageUri?: string;
    timestamp: number;
}

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadUser();
        // Add welcome message
        setMessages([
            {
                id: '1',
                text: 'Hello! I am Shorekeeper AI. How can I help you today?',
                sender: 'ai',
                timestamp: Date.now(),
            },
        ]);
    }, []);

    const loadUser = async () => {
        const data = await getUserData();
        setUser(data);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const sendMessage = async () => {
        if ((!inputText.trim() && !selectedImage) || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            imageUri: selectedImage || undefined,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        const currentImage = selectedImage;
        setSelectedImage(null);
        setLoading(true);

        try {
            // Check for "jalankan game" or "jalankan [game name]" commands
            const lowerText = inputText.toLowerCase();
            if (lowerText.startsWith('jalankan')) {
                const gameName = lowerText.replace('jalankan', '').replace('game', '').trim();
                const games = [
                    { id: '1', name: 'mobile legends', packageName: 'com.mobile.legends' },
                    { id: '2', name: 'free fire', packageName: 'com.dts.freefireth' },
                    { id: '3', name: 'pubg mobile', packageName: 'com.tencent.ig' },
                    { id: '4', name: 'genshin impact', packageName: 'com.miHoYo.GenshinImpact' },
                    { id: '5', name: 'roblox', packageName: 'com.roblox.client' },
                ];

                const foundGame = games.find(g => gameName.includes(g.name) || g.name.includes(gameName));

                if (foundGame) {
                    setLoading(false);
                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        text: `Ok, launching ${foundGame.name}...`,
                        sender: 'ai',
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, aiMessage]);

                    if (Platform.OS === 'android') {
                        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
                            category: 'android.intent.category.LAUNCHER',
                            packageName: foundGame.packageName,
                        });
                    } else {
                        alert("Game launching via text is primary supported on Android. Please use the Games tab.");
                    }
                    return;
                }
            }

            const model = await getGeminiModel();
            let response;

            if (currentImage) {
                const imagePart = await fileToGenerativePart(currentImage, 'image/jpeg');
                const result = await model.generateContent([inputText || 'What is in this image?', imagePart as any]);
                response = result.response.text();
            } else {
                const result = await model.generateContent(inputText);
                response = result.response.text();
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'ai',
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: `Error: ${error.message || 'Something went wrong'}`,
                sender: 'ai',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
        >
            {item.imageUri && (
                <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
            )}
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Shorekeeper AI</Text>
                    <Text style={styles.headerStatus}>{loading ? 'Thinking...' : 'Online'}</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />

                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setSelectedImage(null)}
                        >
                            <X size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View style={styles.inputArea}>
                        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                            <ImageIcon size={24} color="#94a3b8" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor="#64748b"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() && !selectedImage) || loading ? styles.disabledButton : {},
                            ]}
                            onPress={sendMessage}
                            disabled={(!inputText.trim() && !selectedImage) || loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Send size={24} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    headerStatus: {
        fontSize: 12,
        color: '#3b82f6',
    },
    messageList: {
        padding: 16,
        paddingBottom: 32,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#3b82f6',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: Platform.OS === 'ios' ? 0 : 64, // Space for tab bar
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        color: '#fff',
        marginHorizontal: 8,
        maxHeight: 100,
    },
    iconButton: {
        padding: 8,
    },
    sendButton: {
        backgroundColor: '#3b82f6',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#1e293b',
    },
    imagePreviewContainer: {
        padding: 8,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        left: 72,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        padding: 2,
    },
});
