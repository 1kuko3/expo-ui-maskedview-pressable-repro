import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MaskedView } from '@expo/ui/community/masked-view';

function PressTarget({
  label,
  withMask,
  maskPointerEventsNone = false,
}: {
  label: string;
  withMask: boolean;
  maskPointerEventsNone?: boolean;
}) {
  const [count, setCount] = useState(0);
  const log = (event: string) => console.log(`[repro] ${label}: ${event}`);

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPressIn={() => log('pressIn')}
        onPressOut={() => log('pressOut')}
        onLongPress={() => log('longPress')}
        onPress={() => {
          log('press');
          setCount((c) => c + 1);
        }}
        onTouchCancel={() => log('touchCancel')}>
        <Text style={[styles.label, withMask && styles.hidden]}>{label}</Text>
        {withMask ? (
          <MaskedView
            style={[StyleSheet.absoluteFill, maskPointerEventsNone && { pointerEvents: 'none' }]}
            maskElement={
              <View style={styles.maskLayout}>
                <Text style={styles.label}>{label}</Text>
              </View>
            }>
            <View style={[StyleSheet.absoluteFill, styles.fill]} />
          </MaskedView>
        ) : null}
      </Pressable>
      <Text style={styles.count}>onPress: {count}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <PressTarget label="Pressable" withMask={false} />
      <PressTarget label="Pressable + MaskedView" withMask />
      <PressTarget label="+ pointerEvents none" withMask maskPointerEventsNone />
      <View
        style={styles.button}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => console.log('[repro] responder: grant')}
        onResponderRelease={() => console.log('[repro] responder: release')}
        onResponderTerminate={() => console.log('[repro] responder: terminate')}
        onTouchCancel={() => console.log('[repro] responder: touchCancel')}>
        <Text style={[styles.label, styles.hidden]}>Responder + MaskedView</Text>
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <View style={styles.maskLayout}>
              <Text style={styles.label}>Responder + MaskedView</Text>
            </View>
          }>
          <View style={[StyleSheet.absoluteFill, styles.fill]} />
        </MaskedView>
      </View>
      <Text>Tap each button.</Text>
      <Text>1. Plain Pressable: onPress fires.</Text>
      <Text>2. With a MaskedView overlay: the press is cancelled and onPress never fires.</Text>
      <Text>3. Same overlay with pointerEvents: 'none' (workaround): onPress fires.</Text>
      <Text>
        4. A plain responder View with the same overlay: the responder is terminated instead of
        released.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, gap: 24, backgroundColor: '#fff' },
  row: { gap: 8 },
  button: { backgroundColor: '#eee', borderRadius: 12, padding: 16, alignItems: 'center' },
  label: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#222' },
  hidden: { opacity: 0 },
  maskLayout: { flex: 1, padding: 16, alignItems: 'center' },
  fill: { backgroundColor: '#7b3fe4' },
  count: { color: '#555' },
});
