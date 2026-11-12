import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

export default function Modal({ visible, onClose, title, children, scrollable = false }) {
  const Content = scrollable ? ScrollView : View;
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <Content style={scrollable && { maxHeight: '80%' }} showsVerticalScrollIndicator={false}>
            {children}
          </Content>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

export function ConfirmModal({ visible, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.confirmBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, danger && { backgroundColor: COLORS.error }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.lg, paddingBottom: SIZES.xxl, ...SHADOWS.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZES.md },
  title: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  closeBtn: { padding: 4 },
  closeX: { fontSize: 18, color: COLORS.muted },
  confirmBox: { backgroundColor: COLORS.card, margin: SIZES.xl, borderRadius: SIZES.radius.xl, padding: SIZES.xl, ...SHADOWS.lg },
  message: { fontSize: FONTS.sizes.md, color: COLORS.muted, marginTop: 8, marginBottom: SIZES.xl, lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: SIZES.radius.md, backgroundColor: COLORS.secondary, alignItems: 'center' },
  cancelText: { color: COLORS.text, fontWeight: FONTS.weights.semibold },
  confirmBtn: { flex: 1, padding: 14, borderRadius: SIZES.radius.md, backgroundColor: COLORS.primary, alignItems: 'center' },
  confirmText: { color: COLORS.white, fontWeight: FONTS.weights.semibold },
});
