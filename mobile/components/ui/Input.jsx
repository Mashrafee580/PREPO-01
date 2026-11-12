import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

export default function Input({
  label, placeholder, value, onChangeText, secureTextEntry, error,
  keyboardType, autoCapitalize = 'none', multiline, numberOfLines,
  style, inputStyle, icon, rightIcon, onRightIconPress, editable = true,
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrap,
        focused && styles.focused,
        error && styles.errBorder,
        !editable && styles.disabled,
      ]}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && { paddingLeft: 0 }, multiline && { height: 100, textAlignVertical: 'top' }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.mutedLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPw}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.iconRight}>
            <Text style={styles.showHide}>{showPw ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>{rightIcon}</TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SIZES.md },
  label: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: SIZES.radius.md, paddingHorizontal: SIZES.md, ...SHADOWS.sm,
  },
  focused: { borderColor: COLORS.primary },
  errBorder: { borderColor: COLORS.error },
  disabled: { backgroundColor: COLORS.secondary, opacity: 0.7 },
  iconLeft: { marginRight: 10 },
  iconRight: { marginLeft: 8, padding: 4 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, paddingVertical: 13 },
  showHide: { fontSize: FONTS.sizes.sm, color: COLORS.accent, fontWeight: FONTS.weights.semibold },
  errText: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: 4 },
});
