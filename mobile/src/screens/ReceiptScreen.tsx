import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { formatCurrency } from '@agre/shared/utils/currency';

export const ReceiptScreen: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'cash' | 'upi'>('cash');
  const [refNo, setRefNo] = useState('');

  const handleRecord = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    Alert.alert(
      'Receipt Recorded',
      `Received: ${formatCurrency(parseFloat(amount))}\nFrom: ${customerName || 'Customer'}\nVia: ${mode.toUpperCase()}`,
      [{ text: 'OK', onPress: () => { setAmount(''); setCustomerName(''); setRefNo(''); } }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collect Payment (Receipt)</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>CUSTOMER NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="Select or enter customer..."
          placeholderTextColor="#5c6bc0"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.label}>AMOUNT RECEIVED (₹)</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="0.00"
          placeholderTextColor="#5c6bc0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>PAYMENT MODE</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'cash' && styles.modeBtnActive]}
            onPress={() => setMode('cash')}
          >
            <Text style={[styles.modeText, mode === 'cash' && styles.modeTextActive]}>CASH</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'upi' && styles.modeBtnActive]}
            onPress={() => setMode('upi')}
          >
            <Text style={[styles.modeText, mode === 'upi' && styles.modeTextActive]}>UPI / GPAY</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>TRANSACTION REF (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. UPI Ref / Cheque No."
          placeholderTextColor="#5c6bc0"
          value={refNo}
          onChangeText={setRefNo}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleRecord}>
          <Text style={styles.submitText}>RECORD RECEIPT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2358',
    backgroundColor: '#0d1038',
  },
  title: { color: '#ffab40', fontSize: 16, fontWeight: '800' },
  form: { padding: 16 },
  label: { color: '#9fa8da', fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0d1133',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    fontSize: 14,
  },
  amountInput: {
    color: '#fff9c4',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modeRow: { flexDirection: 'row', gap: 10, marginVertical: 4 },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#111538',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  modeBtnActive: { backgroundColor: '#1a237e', borderColor: '#3949ab' },
  modeText: { color: '#9fa8da', fontWeight: 'bold', fontSize: 13 },
  modeTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: '#66bb6a',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { color: '#0a0e27', fontSize: 15, fontWeight: '800' },
});
