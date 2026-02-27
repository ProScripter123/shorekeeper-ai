import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ExternalLink, Globe } from 'lucide-react-native';
import { getGeminiModel } from '../utils/gemini';

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);

    const handleSearch = async () => {
        if (!query.trim() || loading) return;

        setLoading(true);
        try {
            const model = await getGeminiModel();
            const prompt = `Act as a search engine logic. Given the query: "${query}", generate a JSON array of 5 realistic search results (objects with title, url, snippet) that would be relevant. Only return the JSON array content, no markdown formatting.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanedJson = text.replace(/```json|```/g, '').trim();
            const parsedResults = JSON.parse(cleanedJson);
            setResults(parsedResults);
        } catch (error) {
            console.error(error);
            alert('Failed to perform search. Make sure your query is valid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Search</Text>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Search the web with AI..."
                        placeholderTextColor="#64748b"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {loading && <ActivityIndicator size="small" color="#3b82f6" />}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {results.map((result, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => Linking.openURL(result.url)}
                    >
                        <View style={styles.cardHeader}>
                            <Globe size={16} color="#3b82f6" />
                            <Text style={styles.url} numberOfLines={1}>{result.url}</Text>
                        </View>
                        <Text style={styles.resultTitle}>{result.title}</Text>
                        <Text style={styles.snippet}>{result.snippet}</Text>
                        <View style={styles.cardFooter}>
                            <ExternalLink size={14} color="#64748b" />
                            <Text style={styles.footerText}>Open in Browser</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {!loading && results.length === 0 && (
                    <View style={styles.emptyState}>
                        <Search size={48} color="rgba(255,255,255,0.05)" />
                        <Text style={styles.emptyText}>Enter a query to search</Text>
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
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    input: {
        flex: 1,
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    url: {
        marginLeft: 8,
        fontSize: 12,
        color: '#94a3b8',
        flex: 1,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: 8,
    },
    snippet: {
        fontSize: 14,
        color: '#cbd5e1',
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 12,
    },
    footerText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#64748b',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 16,
    },
});
