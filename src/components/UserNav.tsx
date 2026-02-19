import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '../firebase';

interface Props {
  onSignOut?: () => void;
}

export function UserNav({ onSignOut }: Props) {
  const auth = useAuth();
  const { user, loading } = useUser();
  const [visible, setVisible] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleSignOut = async () => {
    if (!auth) return;
    setVisible(false);
    await signOut(auth);
    onSignOut?.();
  };

  if (loading || !user) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.avatarText}>{getInitials(user.displayName)}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
  },
  userInfo: { marginBottom: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: '#f8fafc' },
  userEmail: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  signOutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutText: { color: '#f87171', fontWeight: '600' },
});
