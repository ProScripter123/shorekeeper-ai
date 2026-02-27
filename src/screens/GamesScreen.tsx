import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gamepad2, Play } from 'lucide-react-native';
import * as IntentLauncher from 'expo-intent-launcher';

interface Game {
    id: string;
    name: string;
    packageName: string; // Android package name
    scheme: string; // iOS URL scheme
}

const COMMON_GAMES: Game[] = [
    { id: '1', name: 'Mobile Legends', packageName: 'com.mobile.legends', scheme: 'mobilelegends://' },
    { id: '2', name: 'Free Fire', packageName: 'com.dts.freefireth', scheme: 'freefire://' },
    { id: '3', name: 'PUBG Mobile', packageName: 'com.tencent.ig', scheme: 'pubgmail://' },
    { id: '4', name: 'Genshin Impact', packageName: 'com.miHoYo.GenshinImpact', scheme: 'genshin://' },
    { id: '5', name: 'Roblox', packageName: 'com.roblox.client', scheme: 'roblox://' },
];

export default function GamesScreen() {
    const launchGame = async (game: Game) => {
        try {
            if (Platform.OS === 'android') {
                await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
                    category: 'android.intent.category.LAUNCHER',
                    packageName: game.packageName,
                });
            } else {
                const supported = await Linking.canOpenURL(game.scheme);
                if (supported) {
                    await Linking.openURL(game.scheme);
                } else {
                    alert('Game not found or scheme not supported on this device.');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Could not launch the game. Is it installed?');
        }
    };

    const renderGame = ({ item }: { item: Game }) => (
        <TouchableOpacity style={styles.gameCard} onPress={() => launchGame(item)}>
            <View style={styles.gameIconContainer}>
                <Gamepad2 size={32} color="#3b82f6" />
            </View>
            <View style={styles.gameInfo}>
                <Text style={styles.gameName}>{item.name}</Text>
                <Text style={styles.gameStatus}>Ready to play</Text>
            </View>
            <Play size={24} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Game Mode</Text>
                <Text style={styles.subtitle}>Select a game to launch</Text>
            </View>

            <FlatList
                data={COMMON_GAMES}
                renderItem={renderGame}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
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
    list: {
        padding: 16,
    },
    gameCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    gameIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    gameInfo: {
        flex: 1,
    },
    gameName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    gameStatus: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
});
